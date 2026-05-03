"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Search, Clock, Users } from "lucide-react";
import { toast } from "sonner";
import { mealSchema, type MealInput } from "@/lib/validations";
import { MEAL_TYPE_LABELS, type MealTypeKey } from "@/lib/week-helpers";
import { useMealPlanStore, type MealData } from "@/stores/meal-plan-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";

interface AddToSlotDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planId: string;
  dayOfWeek: number;
  mealType: MealTypeKey;
  dayLabel: string;
}

type Tab = "search" | "create";

export function AddToSlotDialog({
  open,
  onOpenChange,
  planId,
  dayOfWeek,
  mealType,
  dayLabel,
}: AddToSlotDialogProps) {
  const { meals, addEntry, addMeal } = useMealPlanStore();
  const [tab, setTab] = useState<Tab>("search");
  const [search, setSearch] = useState("");
  const [addingId, setAddingId] = useState<string | null>(null);

  const filtered = meals.filter((m) =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  async function selectMeal(meal: MealData) {
    setAddingId(meal.id);
    try {
      const res = await fetch(`/api/meal-plan/${planId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId: meal.id, dayOfWeek, mealType }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      addEntry(json.data);
      onOpenChange(false);
      setSearch("");
      toast.success(`${meal.name} added to ${dayLabel} ${MEAL_TYPE_LABELS[mealType]}`);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to add meal");
    } finally {
      setAddingId(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            Add to {dayLabel} — {MEAL_TYPE_LABELS[mealType]}
          </DialogTitle>
        </DialogHeader>

        {/* Tabs */}
        <div className="flex rounded-lg border p-1 gap-1">
          <button
            className={cn(
              "flex-1 text-sm py-1.5 rounded-md font-medium transition-colors",
              tab === "search"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab("search")}
          >
            Choose Meal
          </button>
          <button
            className={cn(
              "flex-1 text-sm py-1.5 rounded-md font-medium transition-colors",
              tab === "create"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
            onClick={() => setTab("create")}
          >
            Create New
          </button>
        </div>

        {tab === "search" ? (
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search meals..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
              />
            </div>

            <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  {meals.length === 0
                    ? "No meals yet. Create your first one!"
                    : "No meals match your search"}
                </div>
              ) : (
                filtered.map((meal) => (
                  <button
                    key={meal.id}
                    onClick={() => selectMeal(meal)}
                    disabled={addingId === meal.id}
                    className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-accent transition-colors flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{meal.name}</p>
                      {(meal.cookingTime || meal.cuisine) && (
                        <div className="flex items-center gap-2 mt-0.5">
                          {meal.cuisine && (
                            <span className="text-xs text-muted-foreground">{meal.cuisine}</span>
                          )}
                          {meal.cookingTime && (
                            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                              <Clock className="size-3" />
                              {meal.cookingTime}m
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    {addingId === meal.id ? (
                      <Loader2 className="size-4 animate-spin shrink-0" />
                    ) : (
                      <Plus className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        ) : (
          <CreateMealInlineForm
            planId={planId}
            dayOfWeek={dayOfWeek}
            mealType={mealType}
            dayLabel={dayLabel}
            onCreated={() => { onOpenChange(false); setTab("search"); }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

interface CreateMealInlineFormProps {
  planId: string;
  dayOfWeek: number;
  mealType: MealTypeKey;
  dayLabel: string;
  onCreated: () => void;
}

function CreateMealInlineForm({ planId, dayOfWeek, mealType, dayLabel, onCreated }: CreateMealInlineFormProps) {
  const { addEntry, addMeal } = useMealPlanStore();

  const form = useForm<MealInput>({
    resolver: zodResolver(mealSchema),
    defaultValues: { name: "", description: "", cuisine: "", cookingTime: null, servings: null },
  });

  async function onSubmit(data: MealInput) {
    try {
      const mealRes = await fetch("/api/meals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const mealJson = await mealRes.json();
      if (!mealJson.success) throw new Error(mealJson.error);
      addMeal(mealJson.data);

      const entryRes = await fetch(`/api/meal-plan/${planId}/entries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mealId: mealJson.data.id, dayOfWeek, mealType }),
      });
      const entryJson = await entryRes.json();
      if (!entryJson.success) throw new Error(entryJson.error);
      addEntry(entryJson.data);

      toast.success(`${data.name} created and added to ${dayLabel} ${MEAL_TYPE_LABELS[mealType]}`);
      onCreated();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to create meal");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meal Name *</FormLabel>
              <FormControl>
                <Input placeholder="e.g. Chicken Stir Fry" autoFocus {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-3">
          <FormField
            control={form.control}
            name="cuisine"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cuisine</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Asian" {...field} value={field.value ?? ""} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cookingTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cook Time (min)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min="1"
                    placeholder="30"
                    {...field}
                    value={field.value ?? ""}
                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
            {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Create & Add
          </Button>
        </div>
      </form>
    </Form>
  );
}
