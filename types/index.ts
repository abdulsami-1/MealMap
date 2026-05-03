import type { User, Household, PantryItem, GroceryList, GroceryItem, Recipe, RecipeIngredient } from "@prisma/client";

export type { User, Household, PantryItem, GroceryList, GroceryItem, Recipe, RecipeIngredient };

export type ExpiryStatus = "safe" | "soon" | "expired" | "none";

export type GroceryCategory =
  | "produce"
  | "dairy"
  | "meat"
  | "pantry"
  | "frozen"
  | "bakery"
  | "beverages"
  | "other";

export const GROCERY_CATEGORIES: { value: GroceryCategory; label: string }[] = [
  { value: "produce", label: "Produce" },
  { value: "dairy", label: "Dairy & Eggs" },
  { value: "meat", label: "Meat & Seafood" },
  { value: "pantry", label: "Pantry" },
  { value: "frozen", label: "Frozen" },
  { value: "bakery", label: "Bakery" },
  { value: "beverages", label: "Beverages" },
  { value: "other", label: "Other" },
];

export const PANTRY_CATEGORIES = [
  "Produce",
  "Dairy & Eggs",
  "Meat & Seafood",
  "Grains & Bread",
  "Canned Goods",
  "Frozen",
  "Condiments",
  "Snacks",
  "Beverages",
  "Spices & Herbs",
  "Other",
];

export const CUISINE_TYPES = [
  "American",
  "Italian",
  "Mexican",
  "Asian",
  "Mediterranean",
  "Indian",
  "French",
  "Greek",
  "Japanese",
  "Chinese",
  "Thai",
  "Middle Eastern",
  "Other",
];

export const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
export const DAY_NAMES_FULL = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export interface AiRecipeSuggestion {
  name: string;
  ingredients: string[];
  cookingTime: string;
  difficulty: "Easy" | "Medium" | "Hard";
  instructions: string[];
}
