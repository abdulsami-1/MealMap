"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, Users, Heart, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { RecipeWithMeta } from "./recipes-page";

const DIFFICULTY_STYLES = {
  EASY: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
  MEDIUM: "bg-yellow-50 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
  HARD: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const CUISINE_COLORS: Record<string, string> = {
  Italian: "bg-green-100 text-green-700",
  Asian: "bg-orange-100 text-orange-700",
  Mexican: "bg-red-100 text-red-700",
  Indian: "bg-yellow-100 text-yellow-700",
  American: "bg-blue-100 text-blue-700",
  Mediterranean: "bg-cyan-100 text-cyan-700",
  French: "bg-purple-100 text-purple-700",
};

interface RecipeCardProps {
  recipe: RecipeWithMeta;
  onClick: () => void;
  onFavoriteChange: (id: string, isFavorited: boolean) => void;
}

export function RecipeCard({ recipe, onClick, onFavoriteChange }: RecipeCardProps) {
  const [favoriting, setFavoriting] = useState(false);
  const [isFav, setIsFav] = useState(recipe.isFavorited);

  async function toggleFavorite(e: React.MouseEvent) {
    e.stopPropagation();
    setFavoriting(true);
    const prev = isFav;
    setIsFav(!prev);

    try {
      const res = await fetch(`/api/recipes/${recipe.id}/favorite`, { method: "POST" });
      const json = await res.json();
      if (!json.success) {
        setIsFav(prev);
        toast.error("Failed to update favorite");
        return;
      }
      onFavoriteChange(recipe.id, json.data.isFavorited);
      setIsFav(json.data.isFavorited);
    } catch {
      setIsFav(prev);
      toast.error("Failed to update favorite");
    } finally {
      setFavoriting(false);
    }
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      <Card className="cursor-pointer overflow-hidden group py-0 gap-0 hover:shadow-md transition-shadow">
        {/* Color header */}
        <div className="h-24 bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
          <ChefHat className="size-10 text-primary/30" />
          <button
            onClick={toggleFavorite}
            disabled={favoriting}
            className={cn(
              "absolute top-2 right-2 p-1.5 rounded-full transition-all",
              isFav
                ? "bg-red-500 text-white"
                : "bg-white/80 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100"
            )}
          >
            <Heart className={cn("size-3.5", isFav && "fill-current")} />
          </button>
        </div>

        <CardContent className="p-3">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2 mb-2">
            {recipe.name}
          </h3>

          <div className="flex flex-wrap gap-1 mb-2">
            {recipe.cuisine && (
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded",
                  CUISINE_COLORS[recipe.cuisine] ?? "bg-slate-100 text-slate-600"
                )}
              >
                {recipe.cuisine}
              </span>
            )}
            {recipe.difficulty && (
              <span
                className={cn(
                  "text-[10px] font-medium px-1.5 py-0.5 rounded",
                  DIFFICULTY_STYLES[recipe.difficulty]
                )}
              >
                {recipe.difficulty.charAt(0) + recipe.difficulty.slice(1).toLowerCase()}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {recipe.cookingTime && (
              <span className="flex items-center gap-1">
                <Clock className="size-3" />
                {recipe.cookingTime}m
              </span>
            )}
            {recipe.servings && (
              <span className="flex items-center gap-1">
                <Users className="size-3" />
                {recipe.servings}
              </span>
            )}
            <span className="ml-auto text-[10px] text-muted-foreground/60">
              {recipe.ingredients.length} ingredients
            </span>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
