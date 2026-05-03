"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Clock, Users } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MealEntry } from "@/stores/meal-plan-store";

interface MealCardProps {
  entry: MealEntry;
  planId: string;
  onRemove: (entryId: string) => void;
  isDragOverlay?: boolean;
}

export function MealCard({ entry, planId, onRemove, isDragOverlay = false }: MealCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: entry.id,
    data: { entry, planId },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative bg-card border rounded-lg p-2.5 cursor-grab active:cursor-grabbing select-none transition-shadow",
        isDragging && "opacity-40 shadow-none",
        isDragOverlay && "shadow-2xl rotate-2 cursor-grabbing opacity-100 scale-105",
        !isDragging && !isDragOverlay && "hover:shadow-md"
      )}
      {...attributes}
    >
      <div className="flex items-start gap-1.5">
        <div
          {...listeners}
          className="mt-0.5 text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0 cursor-grab active:cursor-grabbing"
        >
          <GripVertical className="size-3.5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium leading-tight line-clamp-2">
            {entry.meal.name}
          </p>
          {(entry.meal.cookingTime || entry.meal.servings) && (
            <div className="flex items-center gap-2 mt-1">
              {entry.meal.cookingTime && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Clock className="size-2.5" />
                  {entry.meal.cookingTime}m
                </span>
              )}
              {entry.meal.servings && (
                <span className="flex items-center gap-0.5 text-[10px] text-muted-foreground">
                  <Users className="size-2.5" />
                  {entry.meal.servings}
                </span>
              )}
            </div>
          )}
        </div>
        {!isDragOverlay && (
          <button
            className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded text-muted-foreground hover:text-destructive shrink-0"
            onClick={(e) => { e.stopPropagation(); onRemove(entry.id); }}
          >
            <Trash2 className="size-3" />
          </button>
        )}
      </div>
    </div>
  );
}
