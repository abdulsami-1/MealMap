import { auth } from "@/lib/auth";
import { aiRecipeRequestSchema } from "@/lib/validations";
import { badRequest, unauthorized, serverError } from "@/lib/api-response";
import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  generateWithFallback,
  buildRecipePrompt,
  parseAndValidateAiResponse,
  GeminiError,
} from "@/lib/gemini";

// 10 requests per user per hour
const AI_RATE_LIMIT = 10;
const AI_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) return unauthorized();

    const { allowed, remaining, resetInMs } = checkRateLimit(
      `ai:${session.user.id}`,
      AI_RATE_LIMIT,
      AI_WINDOW_MS
    );

    if (!allowed) {
      const resetMins = Math.ceil(resetInMs / 60000);
      return NextResponse.json(
        {
          success: false,
          error: `Rate limit reached. Try again in ${resetMins} minute${resetMins !== 1 ? "s" : ""}.`,
        },
        {
          status: 429,
          headers: { "X-RateLimit-Remaining": "0", "X-RateLimit-Reset": String(resetInMs) },
        }
      );
    }

    const body = await request.json();
    const parsed = aiRecipeRequestSchema.safeParse(body);
    if (!parsed.success) return badRequest(parsed.error.errors[0].message);

    const prompt = buildRecipePrompt(parsed.data.ingredients, parsed.data.preferences);

    let raw: string;
    try {
      raw = await generateWithFallback(prompt);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[AI /api/ai/recipes] generateWithFallback threw:", e);
      }

      if (e instanceof GeminiError) {
        // Key not configured
        if (e.status === 0 && e.message.includes("GEMINI_API_KEY")) {
          return NextResponse.json(
            { success: false, error: "AI service not configured. Add GEMINI_API_KEY to .env." },
            { status: 503 }
          );
        }
        // Quota exhausted (free tier)
        if (e.status === 429) {
          return NextResponse.json(
            {
              success: false,
              error:
                "AI generation limit reached for today. This resets automatically — try again tomorrow.",
            },
            { status: 429 }
          );
        }
        // Auth / invalid key
        if (e.status === 400 || e.status === 401 || e.status === 403) {
          return NextResponse.json(
            { success: false, error: `Gemini API key error (${e.status}). Check your GEMINI_API_KEY in .env.` },
            { status: 503 }
          );
        }
        // Model overloaded
        if (e.status === 503) {
          return NextResponse.json(
            { success: false, error: "Gemini is temporarily overloaded. Please try again in a moment." },
            { status: 503 }
          );
        }
        // Network failure
        if (e.status === 0) {
          return NextResponse.json(
            { success: false, error: "Cannot reach Gemini API. Check your internet connection." },
            { status: 503 }
          );
        }
      }

      return NextResponse.json(
        { success: false, error: "AI service error. Please try again." },
        { status: 503 }
      );
    }

    let result;
    try {
      result = parseAndValidateAiResponse(raw);
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        console.error("[AI /api/ai/recipes] parseAndValidateAiResponse threw:", e, "\nRaw:", raw);
      }
      return NextResponse.json(
        { success: false, error: "AI returned an unexpected response. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { success: true, data: result.recipes },
      { headers: { "X-RateLimit-Remaining": String(remaining) } }
    );
  } catch (e) {
    if (process.env.NODE_ENV === "development") {
      console.error("[AI /api/ai/recipes] Unhandled error:", e);
    }
    return serverError();
  }
}
