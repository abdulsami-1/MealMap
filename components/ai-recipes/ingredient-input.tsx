"use client";

import { useState, useRef, KeyboardEvent } from "react";
import { X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface IngredientInputProps {
  ingredients: string[];
  onChange: (ingredients: string[]) => void;
  max?: number;
  placeholder?: string;
  suggestions?: string[];
}

export function IngredientInput({
  ingredients,
  onChange,
  max = 20,
  placeholder = "e.g. chicken, garlic, tomatoes...",
  suggestions = [],
}: IngredientInputProps) {
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  function addIngredient(name: string) {
    const trimmed = name.trim().toLowerCase();
    if (!trimmed || ingredients.includes(trimmed) || ingredients.length >= max) return;
    onChange([...ingredients, trimmed]);
    setValue("");
  }

  function removeIngredient(name: string) {
    onChange(ingredients.filter((i) => i !== name));
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addIngredient(value);
    }
    if (e.key === "Backspace" && !value && ingredients.length > 0) {
      removeIngredient(ingredients[ingredients.length - 1]);
    }
  }

  const filteredSuggestions = suggestions
    .filter((s) => s.toLowerCase().includes(value.toLowerCase()) && !ingredients.includes(s.toLowerCase()))
    .slice(0, 5);

  return (
    <div className="space-y-2">
      <div
        className={cn(
          "min-h-[48px] flex flex-wrap gap-1.5 p-2 border rounded-lg bg-background focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20 transition-all cursor-text",
          ingredients.length >= max && "opacity-60 pointer-events-none"
        )}
        onClick={() => inputRef.current?.focus()}
      >
        <AnimatePresence>
          {ingredients.map((ing) => (
            <motion.span
              key={ing}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="inline-flex items-center gap-1 bg-primary/10 text-primary text-sm px-2.5 py-1 rounded-full font-medium"
            >
              {ing}
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); removeIngredient(ing); }}
                className="text-primary/60 hover:text-primary transition-colors"
              >
                <X className="size-3" />
              </button>
            </motion.span>
          ))}
        </AnimatePresence>

        <input
          ref={inputRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={ingredients.length === 0 ? placeholder : ""}
          disabled={ingredients.length >= max}
          className="flex-1 min-w-[120px] outline-none bg-transparent text-sm placeholder:text-muted-foreground"
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Press Enter or comma to add · {ingredients.length}/{max} ingredients
      </p>

      {/* Pantry suggestions */}
      {value && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          <span className="text-xs text-muted-foreground self-center">From pantry:</span>
          {filteredSuggestions.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addIngredient(s)}
              className="text-xs px-2 py-1 rounded-full border border-dashed border-border hover:border-primary hover:text-primary transition-colors flex items-center gap-1"
            >
              <Plus className="size-2.5" />
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
