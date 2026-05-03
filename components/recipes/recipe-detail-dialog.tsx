"use client";

import { Clock, Users, ChefHat, BookOpen } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import type { RecipeWithMeta } from "./recipes-page";

interface RecipeDetailDialogProps {
  recipe: RecipeWithMeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DIFFICULTY_STYLES = {
  EASY: "bg-emerald-50 text-emerald-700",
  MEDIUM: "bg-yellow-50 text-yellow-600",
  HARD: "bg-red-100 text-red-700",
};

export function RecipeDetailDialog({ recipe, open, onOpenChange }: RecipeDetailDialogProps) {
  if (!recipe) return null;

  const steps = recipe.instructions
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-6 py-4 border-b">
          <DialogTitle className="text-xl leading-tight pr-8">{recipe.name}</DialogTitle>

          <div className="flex flex-wrap gap-2 mt-3">
            {recipe.cuisine && (
              <Badge variant="secondary">{recipe.cuisine}</Badge>
            )}
            {recipe.difficulty && (
              <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", DIFFICULTY_STYLES[recipe.difficulty])}>
                {recipe.difficulty.charAt(0) + recipe.difficulty.slice(1).toLowerCase()}
              </span>
            )}
            {recipe.cookingTime && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> {recipe.cookingTime}m cook
              </span>
            )}
            {recipe.prepTime && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Clock className="size-3" /> {recipe.prepTime}m prep
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="size-3" /> {recipe.servings} servings
              </span>
            )}
          </div>

          {recipe.description && (
            <p className="text-sm text-muted-foreground mt-3">{recipe.description}</p>
          )}
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          <div className="p-6 space-y-6 pb-8">
            {/* Ingredients */}
            <section>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                <ChefHat className="size-4" />
                Ingredients ({recipe.ingredients.length})
              </h3>
              <ul className="space-y-1.5">
                {recipe.ingredients.map((ing) => (
                  <li key={ing.id} className="flex items-baseline gap-2 text-sm">
                    <span className="size-1.5 rounded-full bg-primary shrink-0 mt-1.5" />
                    <span>
                      {ing.quantity && <span className="font-medium">{ing.quantity} {ing.unit} </span>}
                      {ing.name}
                      {ing.notes && <span className="text-muted-foreground"> ({ing.notes})</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </section>

            <Separator />

            {/* Instructions */}
            <section>
              <h3 className="font-semibold text-sm uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen className="size-4" />
                Instructions
              </h3>
              <ol className="space-y-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-sm">
                    <span className="flex-shrink-0 size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {i + 1}
                    </span>
                    <p className="pt-0.5 leading-relaxed">{step.replace(/^step\s*\d+[:.]\s*/i, "")}</p>
                  </li>
                ))}
              </ol>
            </section>

            {recipe.tags.length > 0 && (
              <>
                <Separator />
                <div className="flex flex-wrap gap-1.5">
                  {recipe.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">#{tag}</Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
