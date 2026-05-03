import { z } from "zod";

// ─── Auth ────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

// ─── Household ───────────────────────────────────────────────────────────────

export const createHouseholdSchema = z.object({
  name: z.string().min(1, "Household name is required").max(100),
});

export type CreateHouseholdInput = z.infer<typeof createHouseholdSchema>;

// ─── Pantry ──────────────────────────────────────────────────────────────────

export const pantryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  quantity: z.number().positive("Quantity must be positive"),
  unit: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  expiryDate: z.string().datetime().optional().nullable(),
  lowStockAt: z.number().positive().optional().nullable(),
  notes: z.string().max(500).optional(),
});

export type PantryItemInput = z.infer<typeof pantryItemSchema>;

// ─── Grocery List ────────────────────────────────────────────────────────────

export const groceryListSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
});

export const groceryItemSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  quantity: z.number().positive().optional().nullable(),
  unit: z.string().max(20).optional(),
  category: z.string().max(50).optional(),
  notes: z.string().max(500).optional(),
});

export type GroceryListInput = z.infer<typeof groceryListSchema>;
export type GroceryItemInput = z.infer<typeof groceryItemSchema>;

// ─── Meal ────────────────────────────────────────────────────────────────────

export const mealSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  cuisine: z.string().max(50).optional(),
  cookingTime: z.number().int().positive().max(480).optional().nullable(),
  servings: z.number().int().positive().max(100).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
});

export const mealPlanEntrySchema = z.object({
  mealPlanId: z.string().cuid(),
  mealId: z.string().cuid(),
  dayOfWeek: z.number().int().min(0).max(6),
  mealType: z.enum(["BREAKFAST", "LUNCH", "DINNER", "SNACK"]),
});

export type MealInput = z.infer<typeof mealSchema>;
export type MealPlanEntryInput = z.infer<typeof mealPlanEntrySchema>;

// ─── Recipe ──────────────────────────────────────────────────────────────────

export const recipeIngredientSchema = z.object({
  name: z.string().min(1).max(100),
  quantity: z.number().positive().optional().nullable(),
  unit: z.string().max(20).optional(),
  notes: z.string().max(200).optional(),
});

export const recipeSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  description: z.string().max(1000).optional(),
  cuisine: z.string().max(50).optional(),
  cookingTime: z.number().int().positive().max(480).optional().nullable(),
  prepTime: z.number().int().positive().max(480).optional().nullable(),
  servings: z.number().int().positive().max(100).optional().nullable(),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD"]).optional().nullable(),
  imageUrl: z.string().url().optional().nullable(),
  instructions: z.string().min(1, "Instructions are required"),
  tags: z.array(z.string().max(30)).max(10).default([]),
  isPublic: z.boolean().default(true),
  ingredients: z.array(recipeIngredientSchema).min(1, "At least one ingredient required"),
});

export type RecipeInput = z.infer<typeof recipeSchema>;

// ─── AI ──────────────────────────────────────────────────────────────────────

export const aiRecipeRequestSchema = z.object({
  ingredients: z
    .array(z.string().min(1).max(100))
    .min(1, "At least one ingredient required")
    .max(20, "Maximum 20 ingredients"),
  preferences: z.string().max(200).optional(),
});

export type AiRecipeRequestInput = z.infer<typeof aiRecipeRequestSchema>;
