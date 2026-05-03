import { z } from "zod";

const PRIMARY_MODEL = "gemini-2.5-flash";
const FALLBACK_MODEL = "gemini-2.5-flash-lite";
const BASE_URL = "https://generativelanguage.googleapis.com/v1beta/models";

const geminiBodyConfig = {
  generationConfig: {
    temperature: 0.7,
    topK: 32,
    topP: 0.95,
    maxOutputTokens: 4096,
    // Disable thinking for 2.5 models — structured JSON output doesn't need it
    // and thinking tokens consume the output budget
    thinkingConfig: {
      thinkingBudget: 0,
    },
  },
};

class GeminiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly geminiMessage?: string
  ) {
    super(message);
    this.name = "GeminiError";
  }
}

async function callGemini(model: string, prompt: string): Promise<string> {
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === "REPLACE_WITH_YOUR_GEMINI_KEY") {
    throw new GeminiError("GEMINI_API_KEY not configured", 0);
  }

  const url = `${BASE_URL}/${model}:generateContent?key=${key}`;
  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    ...geminiBodyConfig,
  };

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
  } catch (e) {
    throw new GeminiError(`Network error reaching Gemini: ${e instanceof Error ? e.message : "unknown"}`, 0);
  }

  if (!res.ok) {
    let errorBody: { error?: { message?: string; status?: string } } = {};
    try {
      errorBody = await res.json();
    } catch {
      // ignore parse failure
    }
    const geminiMsg = errorBody?.error?.message ?? `HTTP ${res.status}`;
    if (process.env.NODE_ENV === "development") {
      console.error(`[Gemini ${model}] ${res.status} ${errorBody?.error?.status ?? ""}:`, geminiMsg);
    }
    throw new GeminiError(`Gemini error ${res.status}`, res.status, geminiMsg);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text || typeof text !== "string") {
    throw new GeminiError("Invalid response shape from Gemini", res.status);
  }

  return text;
}

export async function generateWithFallback(prompt: string): Promise<string> {
  try {
    return await callGemini(PRIMARY_MODEL, prompt);
  } catch (e) {
    if (e instanceof GeminiError && (e.status === 503 || e.status === 429)) {
      if (process.env.NODE_ENV === "development") {
        console.warn(`[Gemini] Primary model failed (${e.status}), trying fallback ${FALLBACK_MODEL}`);
      }
      try {
        return await callGemini(FALLBACK_MODEL, prompt);
      } catch (fe) {
        // Rethrow fallback error if it's quota/rate — original error is the same root cause
        throw fe;
      }
    }
    throw e;
  }
}

// ─── AI Recipe Schemas ───────────────────────────────────────────────────────

const aiRecipeSchema = z.object({
  name: z.string().min(1).max(200),
  ingredients: z.array(z.string().min(1)).min(1).max(20),
  cookingTime: z.string().min(1).max(50),
  difficulty: z.enum(["Easy", "Medium", "Hard"]),
  instructions: z.array(z.string().min(1)).min(1).max(20),
});

export const aiResponseSchema = z.object({
  recipes: z.array(aiRecipeSchema).min(1).max(3),
});

export type AiRecipe = z.infer<typeof aiRecipeSchema>;
export type AiResponse = z.infer<typeof aiResponseSchema>;

export function buildRecipePrompt(
  ingredients: string[],
  preferences?: string
): string {
  return `You are a practical home cooking assistant. Suggest exactly 3 realistic recipes that can be made primarily from the ingredients provided.

STRICT RULES:
1. Only suggest recipes using common, accessible everyday ingredients that any home cook would have
2. Each recipe must be practical for weeknight home cooking (under 60 minutes total)
3. Prioritize using the listed ingredients — you may add up to 5 common pantry staples (salt, pepper, oil, butter, garlic, onion, flour, eggs, milk) if needed
4. Do NOT suggest restaurant-level techniques or exotic ingredients
5. Return ONLY valid JSON — no markdown, no backticks, no explanation text
${preferences ? `6. User preferences: ${preferences}` : ""}

AVAILABLE INGREDIENTS: ${ingredients.join(", ")}

Return this exact JSON structure with no other text:
{
  "recipes": [
    {
      "name": "Recipe Name",
      "ingredients": ["1 cup flour", "2 eggs", "..."],
      "cookingTime": "25 minutes",
      "difficulty": "Easy",
      "instructions": ["Step 1: ...", "Step 2: ...", "..."]
    }
  ]
}`;
}

export function parseAndValidateAiResponse(raw: string): AiResponse {
  // Strip markdown code fences if present
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("AI returned malformed JSON");
  }

  const result = aiResponseSchema.safeParse(parsed);
  if (!result.success) {
    if (process.env.NODE_ENV === "development") {
      console.error("[Gemini] Schema validation failed:", result.error.issues);
    }
    throw new Error("AI response missing required fields");
  }

  return result.data;
}

export { GeminiError };
