"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, Heart, Plus, Search, SlidersHorizontal, X } from "lucide-react";
import { RecipeCard } from "./recipe-card";
import { RecipeDetailDialog } from "./recipe-detail-dialog";
import { CreateRecipeDialog } from "./create-recipe-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CUISINE_TYPES } from "@/types";
import type { Recipe, RecipeIngredient } from "@prisma/client";

export type RecipeWithMeta = Recipe & {
  ingredients: RecipeIngredient[];
  isFavorited: boolean;
  favoriteCount: number;
};

interface RecipesPageProps {
  initialRecipes: RecipeWithMeta[];
}

export function RecipesPage({ initialRecipes }: RecipesPageProps) {
  const [recipes, setRecipes] = useState<RecipeWithMeta[]>(initialRecipes);
  const [search, setSearch] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("all");
  const [difficultyFilter, setDifficultyFilter] = useState("all");
  const [tab, setTab] = useState<"all" | "favorites">("all");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeWithMeta | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const filtered = useMemo(() => {
    return recipes.filter((r) => {
      if (tab === "favorites" && !r.isFavorited) return false;
      if (search && !r.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (cuisineFilter !== "all" && r.cuisine !== cuisineFilter) return false;
      if (difficultyFilter !== "all" && r.difficulty !== difficultyFilter) return false;
      return true;
    });
  }, [recipes, search, cuisineFilter, difficultyFilter, tab]);

  function handleFavoriteChange(id: string, isFavorited: boolean) {
    setRecipes((prev) =>
      prev.map((r) => (r.id === id ? { ...r, isFavorited } : r))
    );
  }

  const hasFilters = search || cuisineFilter !== "all" || difficultyFilter !== "all";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipe Library</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {recipes.length} recipe{recipes.length !== 1 ? "s" : ""}
            {" · "}
            {recipes.filter((r) => r.isFavorited).length} favorited
          </p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="size-4 mr-1.5" />
          Add Recipe
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search recipes..."
            className="pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Cuisine" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Cuisines</SelectItem>
              {CUISINE_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Any Level</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button variant="ghost" size="icon" onClick={() => { setSearch(""); setCuisineFilter("all"); setDifficultyFilter("all"); }}>
              <X className="size-4" />
            </Button>
          )}
        </div>
      </div>

      <Tabs value={tab} onValueChange={(v) => setTab(v as "all" | "favorites")}>
        <TabsList>
          <TabsTrigger value="all">
            <BookOpen className="size-3.5" />
            All Recipes
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="size-3.5" />
            Favorites ({recipes.filter((r) => r.isFavorited).length})
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          hasFavorites={tab === "favorites"}
          hasSearch={!!hasFilters}
          onClear={() => { setSearch(""); setCuisineFilter("all"); setDifficultyFilter("all"); setTab("all"); }}
          onAdd={() => setCreateOpen(true)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((recipe) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <RecipeCard
                  recipe={recipe}
                  onClick={() => setSelectedRecipe(recipe)}
                  onFavoriteChange={handleFavoriteChange}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <RecipeDetailDialog
        recipe={selectedRecipe}
        open={!!selectedRecipe}
        onOpenChange={(open) => !open && setSelectedRecipe(null)}
      />

      <CreateRecipeDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onCreated={(r) => setRecipes((prev) => [r, ...prev])}
      />
    </div>
  );
}

function EmptyState({
  hasFavorites,
  hasSearch,
  onClear,
  onAdd,
}: {
  hasFavorites: boolean;
  hasSearch: boolean;
  onClear: () => void;
  onAdd: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed rounded-xl">
      <div className="p-4 rounded-full bg-muted mb-4">
        <BookOpen className="size-8 text-muted-foreground" />
      </div>
      {hasFavorites ? (
        <>
          <p className="font-medium">No favorited recipes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Heart a recipe to save it here</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>Browse All</Button>
        </>
      ) : hasSearch ? (
        <>
          <p className="font-medium">No recipes match your filters</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={onClear}>
            <X className="size-4 mr-1.5" />Clear Filters
          </Button>
        </>
      ) : (
        <>
          <p className="font-medium">Your recipe library is empty</p>
          <p className="text-sm text-muted-foreground mt-1">Add your first recipe or use AI to generate ideas</p>
          <Button size="sm" className="mt-4" onClick={onAdd}>
            <Plus className="size-4 mr-1.5" />Add First Recipe
          </Button>
        </>
      )}
    </div>
  );
}

export function RecipesPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between"><Skeleton className="h-7 w-40" /><Skeleton className="h-9 w-28" /></div>
      <div className="flex gap-3"><Skeleton className="h-9 flex-1" /><Skeleton className="h-9 w-36" /></div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
      </div>
    </div>
  );
}
