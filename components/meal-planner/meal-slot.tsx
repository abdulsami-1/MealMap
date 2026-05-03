"use client";

import { useDroppable } from "@dnd-kit/core";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { MealCard } from "./meal-card";
import type { MealEntry } from "@/stores/meal-plan-store";
import type { MealTypeKey } from "@/lib/week-helpers";

interface MealSlotProps {
  dayOfWeek: number;
  mealType: MealTypeKey;
  planId: string;
  entry: MealEntry | undefined;
  onAdd: (dayOfWeek: number, mealType: MealTypeKey) => void;
  onRemove: (entryId: string) => void;
}

export function MealSlot({ dayOfWeek, mealType, planId, entry, onAdd, onRemove }: MealSlotProps) {
  const slotId = `${dayOfWeek}-${mealType}`;
  const { isOver, setNodeRef } = useDroppable({ id: slotId, data: { dayOfWeek, mealType } });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-[72px] rounded-lg border-2 border-dashed transition-all duration-150 relative",
        isOver
          ? "border-primary bg-primary/5 scale-[1.02]"
          : entry
            ? "border-transparent bg-transparent p-0"
            : "border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40"
      )}
    >
      {entry ? (
        <MealCard entry={entry} planId={planId} onRemove={onRemove} />
      ) : (
        <button
          onClick={() => onAdd(dayOfWeek, mealType)}
          className="absolute inset-0 flex items-center justify-center w-full h-full rounded-lg text-muted-foreground/40 hover:text-muted-foreground transition-colors group"
        >
          <Plus className="size-4 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </div>
  );
}
