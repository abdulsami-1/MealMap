"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Clock, BarChart2, BookmarkPlus, Loader2, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { AiRecipe } from "@/lib/gemini";

const DIFFICULTY_STYLES = {
  Easy: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  Medium: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  Hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

interface AiRecipeCardProps {
  recipe: AiRecipe;
  index: number;
}

export function AiRecipeCard({ recipe, index }: AiRecipeCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function saveToLibrary() {
    setSaving(true);
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: recipe.name,
          instructions: recipe.instructions.join("\n"),
          cookingTime: parseInt(recipe.cookingTime) || null,
          difficulty: recipe.difficulty.toUpperCase(),
          isPublic: false,
          tags: ["ai-generated"],
          ingredients: recipe.ingredients.map((ing) => {
            const parts = ing.match(/^([\d/.]+\s*\w*)\s+(.+)$/);
            return parts
              ? { name: parts[2].trim(), notes: parts[1].trim() }
              : { name: ing };
          }),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setSaved(true);
      toast.success(`"${recipe.name}" saved to recipe library`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save recipe");
    } finally {
      setSaving(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="size-6 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center justify-center shrink-0">
                  {index + 1}
                </span>
                <CardTitle className="text-base leading-tight">{recipe.name}</CardTitle>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="size-3" /> {recipe.cookingTime}
                </span>
                <span
                  className={cn(
                    "text-xs font-medium px-1.5 py-0.5 rounded",
                    DIFFICULTY_STYLES[recipe.difficulty]
                  )}
                >
                  {recipe.difficulty}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {recipe.ingredients.length} ingredients
                </Badge>
              </div>
            </div>
            <Button
              size="sm"
              variant={saved ? "outline" : "default"}
              onClick={saveToLibrary}
              disabled={saving || saved}
              className="shrink-0"
            >
              {saving ? (
                <Loader2 className="size-3.5 animate-spin" />
              ) : saved ? (
                <><Check className="size-3.5 mr-1.5" /> Saved</>
              ) : (
                <><BookmarkPlus className="size-3.5 mr-1.5" /> Save</>
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Ingredients preview */}
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
              Ingredients
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1">
              {recipe.ingredients.map((ing, i) => (
                <li key={i} className="flex items-center gap-1.5 text-sm">
                  <span className="size-1 rounded-full bg-muted-foreground/40 shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Instructions toggle */}
          <button
            onClick={() => setExpanded(!expanded)}
            className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1"
          >
            <span>{expanded ? "Hide" : "Show"} Instructions</span>
            <motion.div animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="size-4" />
            </motion.div>
          </button>

          <AnimatePresence>
            {expanded && (
              <motion.ol
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.25 }}
                className="space-y-2 overflow-hidden"
              >
                {recipe.instructions.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 size-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold mt-0.5">
                      {i + 1}
                    </span>
                    <p className="leading-relaxed">{step.replace(/^step\s*\d+[:.]\s*/i, "")}</p>
                  </li>
                ))}
              </motion.ol>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
