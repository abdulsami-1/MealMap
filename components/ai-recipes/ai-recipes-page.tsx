"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, RefreshCw, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { IngredientInput } from "./ingredient-input";
import { AiRecipeCard } from "./ai-recipe-card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import type { AiRecipe } from "@/lib/gemini";

interface AiRecipesPageProps {
  pantryIngredients: string[];
}

export function AiRecipesPage({ pantryIngredients }: AiRecipesPageProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [preferences, setPreferences] = useState("");
  const [recipes, setRecipes] = useState<AiRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generated, setGenerated] = useState(false);

  async function handleGenerate() {
    if (ingredients.length === 0) {
      toast.error("Add at least one ingredient");
      return;
    }

    setLoading(true);
    setError(null);
    setRecipes([]);

    try {
      const res = await fetch("/api/ai/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients, preferences: preferences || undefined }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error ?? "Failed to generate recipes");
        return;
      }

      setRecipes(json.data);
      setGenerated(true);
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleReset() {
    setIngredients([]);
    setPreferences("");
    setRecipes([]);
    setError(null);
    setGenerated(false);
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2.5 mb-1">
          <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
            <Sparkles className="size-5 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Use What You Have</h1>
        </div>
        <p className="text-muted-foreground text-sm">
          Tell us what ingredients you have and Gemini AI will suggest 3 practical recipes you can make right now.
        </p>
      </div>

      {/* Input section */}
      <Card>
        <CardContent className="pt-6 space-y-5">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Your Ingredients *
            </Label>
            <IngredientInput
              ingredients={ingredients}
              onChange={setIngredients}
              max={20}
              suggestions={pantryIngredients}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-semibold">
              Preferences <span className="font-normal text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="e.g. vegetarian only, no spicy food, quick meals under 30 minutes..."
              rows={2}
              className="resize-none"
              value={preferences}
              onChange={(e) => setPreferences(e.target.value)}
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{preferences.length}/200</p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleGenerate}
              disabled={loading || ingredients.length === 0}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  Generate Recipes
                </>
              )}
            </Button>

            {generated && (
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <RefreshCw className="size-4 mr-1.5" />
                Start Over
              </Button>
            )}

            {ingredients.length > 0 && !loading && !generated && (
              <p className="text-sm text-muted-foreground">
                {ingredients.length} ingredient{ingredients.length !== 1 ? "s" : ""} ready
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loading skeleton */}
      <AnimatePresence>
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-purple-600" />
              <span>Asking Gemini to find recipes with your ingredients...</span>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-36 rounded-xl bg-muted animate-pulse" style={{ animationDelay: `${i * 0.15}s` }} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-3 p-4 rounded-lg border border-destructive/30 bg-destructive/5"
        >
          <AlertCircle className="size-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-destructive">Generation failed</p>
            <p className="text-sm text-muted-foreground mt-0.5">{error}</p>
            <Button variant="outline" size="sm" className="mt-3" onClick={handleGenerate} disabled={loading}>
              Try again
            </Button>
          </div>
        </motion.div>
      )}

      {/* Results */}
      <AnimatePresence>
        {recipes.length > 0 && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-lg">
                {recipes.length} Recipe{recipes.length !== 1 ? "s" : ""} Found
              </h2>
              <Button variant="ghost" size="sm" onClick={handleGenerate} disabled={loading}>
                <RefreshCw className="size-4 mr-1.5" />
                Regenerate
              </Button>
            </div>
            {recipes.map((recipe, i) => (
              <AiRecipeCard key={`${recipe.name}-${i}`} recipe={recipe} index={i} />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty prompt */}
      {!loading && !error && !generated && ingredients.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center py-12 text-center"
        >
          <div className="text-5xl mb-4">🧑‍🍳</div>
          <p className="font-medium">Add your available ingredients above</p>
          <p className="text-sm text-muted-foreground mt-1 max-w-xs">
            Gemini will suggest 3 practical recipes you can cook tonight using what you already have
          </p>
          {pantryIngredients.length > 0 && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">
                Quick add from your pantry:
              </p>
              <div className="flex flex-wrap justify-center gap-1.5 max-w-sm">
                {pantryIngredients.slice(0, 8).map((ing) => (
                  <button
                    key={ing}
                    onClick={() => setIngredients((prev) => prev.includes(ing) ? prev : [...prev, ing])}
                    className="text-xs px-2.5 py-1 rounded-full border hover:border-primary hover:text-primary transition-colors"
                  >
                    {ing}
                  </button>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
