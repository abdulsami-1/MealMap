"use client";

import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { recipeSchema, type RecipeInput } from "@/lib/validations";
import { CUISINE_TYPES } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import type { RecipeWithMeta } from "./recipes-page";

interface CreateRecipeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (recipe: RecipeWithMeta) => void;
}

export function CreateRecipeDialog({ open, onOpenChange, onCreated }: CreateRecipeDialogProps) {
  const form = useForm<RecipeInput>({
    resolver: zodResolver(recipeSchema),
    defaultValues: {
      name: "",
      description: "",
      cuisine: "",
      cookingTime: null,
      prepTime: null,
      servings: null,
      difficulty: null,
      instructions: "",
      tags: [],
      isPublic: false,
      ingredients: [{ name: "", quantity: null, unit: "", notes: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  async function onSubmit(data: RecipeInput) {
    try {
      const res = await fetch("/api/recipes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      onCreated({ ...json.data, isFavorited: false, favoriteCount: 0 });
      form.reset();
      onOpenChange(false);
      toast.success("Recipe saved to library");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to save recipe");
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {/*
        Layout contract:
          DialogContent  — flex col, max-h-90vh, overflow-hidden (clips children)
          Header         — shrink-0, always visible at top
          Scroll body    — flex-1 min-h-0 overflow-y-auto (plain div, no Radix wrapper)
          Footer         — shrink-0, always visible at bottom
      */}
      <DialogContent className="sm:max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0 overflow-hidden">

        {/* ── Fixed header ── */}
        <DialogHeader className="flex-shrink-0 px-6 py-4 border-b">
          <DialogTitle>Add Recipe to Library</DialogTitle>
        </DialogHeader>

        {/* ── Scrollable body ── */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <Form {...form}>
            <form
              id="recipe-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="px-6 py-5 space-y-5 pb-8"
            >
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Creamy Pasta Carbonara" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Brief description..."
                        rows={2}
                        className="resize-none"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cuisine / Difficulty / Prep / Cook / Servings */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <FormField
                  control={form.control}
                  name="cuisine"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Cuisine</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CUISINE_TYPES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Difficulty</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select difficulty" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EASY">Easy</SelectItem>
                          <SelectItem value="MEDIUM">Medium</SelectItem>
                          <SelectItem value="HARD">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="prepTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Prep (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number" min="1" placeholder="15"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
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
                      <FormLabel>Cook (min)</FormLabel>
                      <FormControl>
                        <Input
                          type="number" min="1" placeholder="30"
                          {...field}
                          value={field.value ?? ""}
                          onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="servings"
                  render={({ field }) => (
                    <FormItem className="col-span-2">
                      <FormLabel>Servings</FormLabel>
                      <FormControl>
                        <Input
                          type="number" min="1" placeholder="4"
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

              <Separator />

              {/* Ingredients */}
              <div>
                <p className="text-sm font-medium mb-3">Ingredients *</p>
                <div className="space-y-2">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex gap-2 items-center">
                      <Input
                        placeholder="Ingredient name"
                        className="flex-1 min-w-0"
                        {...form.register(`ingredients.${index}.name`)}
                      />
                      <Input
                        type="number"
                        placeholder="Qty"
                        className="w-16 shrink-0"
                        {...form.register(`ingredients.${index}.quantity`, {
                          setValueAs: (v) => (v === "" ? null : parseFloat(v)),
                        })}
                      />
                      <Input
                        placeholder="Unit"
                        className="w-16 shrink-0"
                        {...form.register(`ingredients.${index}.unit`)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                        disabled={fields.length === 1}
                        onClick={() => remove(index)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                {form.formState.errors.ingredients?.root && (
                  <p className="text-destructive text-sm mt-1">
                    {form.formState.errors.ingredients.root.message}
                  </p>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-3"
                  onClick={() => append({ name: "", quantity: null, unit: "", notes: "" })}
                >
                  <Plus className="size-4 mr-1.5" />
                  Add Ingredient
                </Button>
              </div>

              <Separator />

              {/* Instructions */}
              <FormField
                control={form.control}
                name="instructions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Instructions *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={"Step 1: Boil water...\nStep 2: Add pasta..."}
                        className="resize-y font-mono text-sm min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </form>
          </Form>
        </div>

        {/* ── Fixed footer ── */}
        <div className="flex-shrink-0 px-6 py-4 border-t bg-background flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={form.formState.isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            form="recipe-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting && <Loader2 className="mr-2 size-4 animate-spin" />}
            Save Recipe
          </Button>
        </div>

      </DialogContent>
    </Dialog>
  );
}
