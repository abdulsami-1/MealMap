"use client";

import { useEffect, useState, useCallback } from "react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { motion } from "framer-motion";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import {
  useMealPlanStore,
  type MealEntry,
  type MealData,
  type MealPlanData,
} from "@/stores/meal-plan-store";
import {
  DISPLAY_DAYS,
  MEAL_TYPES,
  MEAL_TYPE_LABELS,
  MEAL_TYPE_ICONS,
  getWeekStart,
  nextWeek,
  prevWeek,
  toISODate,
  dateForDay,
  type MealTypeKey,
} from "@/lib/week-helpers";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { MealCard } from "./meal-card";
import { MealSlot } from "./meal-slot";
import { WeekNavigator } from "./week-navigator";
import { AddToSlotDialog } from "./add-to-slot-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MealType } from "@prisma/client";

interface MealPlannerPageProps {
  initialPlan: MealPlanData | null;
  initialMeals: MealData[];
  initialWeekStart: Date;
}

export function MealPlannerPage({
  initialPlan,
  initialMeals,
  initialWeekStart,
}: MealPlannerPageProps) {
  const { plan, meals, setPlan, setMeals, setWeekStart, weekStart, moveEntry, removeEntry, isLoading, setLoading } =
    useMealPlanStore();

  const [activeDragEntry, setActiveDragEntry] = useState<MealEntry | null>(null);
  const [slotDialog, setSlotDialog] = useState<{
    open: boolean;
    dayOfWeek: number;
    mealType: MealTypeKey;
    dayLabel: string;
  } | null>(null);

  useEffect(() => {
    setPlan(initialPlan);
    setMeals(initialMeals);
    setWeekStart(initialWeekStart);
  }, [initialPlan, initialMeals, initialWeekStart, setPlan, setMeals, setWeekStart]);

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  async function loadWeek(newWeekStart: Date) {
    setLoading(true);
    setWeekStart(newWeekStart);
    try {
      const res = await fetch(`/api/meal-plan?week=${toISODate(newWeekStart)}`);
      const json = await res.json();
      if (json.success) {
        setPlan(json.data);
      }
    } catch {
      toast.error("Failed to load week");
    } finally {
      setLoading(false);
    }
  }

  async function ensurePlanExists(): Promise<string | null> {
    if (plan?.id) return plan.id;
    try {
      const res = await fetch("/api/meal-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ week: toISODate(weekStart) }),
      });
      const json = await res.json();
      if (json.success) {
        setPlan(json.data);
        return json.data.id;
      }
    } catch {
      toast.error("Failed to create meal plan");
    }
    return null;
  }

  function handleDragStart(event: DragStartEvent) {
    const entry = plan?.entries.find((e) => e.id === event.active.id);
    if (entry) setActiveDragEntry(entry);
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveDragEntry(null);
    const { active, over } = event;
    if (!over || !plan) return;

    const entryId = active.id as string;
    const [dayStr, mealType] = (over.id as string).split("-");
    const newDay = parseInt(dayStr);
    const newMealType = mealType as MealType;

    const entry = plan.entries.find((e) => e.id === entryId);
    if (!entry) return;

    // Same slot — no-op
    if (entry.dayOfWeek === newDay && entry.mealType === newMealType) return;

    // Optimistic update
    moveEntry(entryId, newDay, newMealType);

    // Handle swap: if target occupied, move existing to source slot
    const targetEntry = plan.entries.find(
      (e) => e.dayOfWeek === newDay && e.mealType === newMealType && e.id !== entryId
    );
    if (targetEntry) {
      moveEntry(targetEntry.id, entry.dayOfWeek, entry.mealType);
    }

    try {
      const res = await fetch(`/api/meal-plan/${plan.id}/entries/${entryId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayOfWeek: newDay, mealType: newMealType }),
      });
      const json = await res.json();
      if (!json.success) {
        // Revert on failure
        moveEntry(entryId, entry.dayOfWeek, entry.mealType);
        if (targetEntry) moveEntry(targetEntry.id, newDay, newMealType);
        toast.error("Failed to move meal");
      }
    } catch {
      moveEntry(entryId, entry.dayOfWeek, entry.mealType);
      if (targetEntry) moveEntry(targetEntry.id, newDay, newMealType);
      toast.error("Failed to move meal");
    }
  }

  async function handleRemoveEntry(entryId: string) {
    if (!plan) return;
    removeEntry(entryId);
    try {
      const res = await fetch(`/api/meal-plan/${plan.id}/entries/${entryId}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (!json.success) {
        toast.error("Failed to remove meal");
        // Reload to restore state
        loadWeek(weekStart);
      }
    } catch {
      toast.error("Failed to remove meal");
      loadWeek(weekStart);
    }
  }

  async function openAddSlot(dayOfWeek: number, mealType: MealTypeKey) {
    const planId = await ensurePlanExists();
    if (!planId) return;
    const dayInfo = DISPLAY_DAYS.find((d) => d.dayOfWeek === dayOfWeek);
    setSlotDialog({
      open: true,
      dayOfWeek,
      mealType,
      dayLabel: dayInfo?.short ?? "Day",
    });
  }

  const currentPlan = plan;
  const currentWeekStart = weekStart;

  function getEntry(dayOfWeek: number, mealType: MealTypeKey): MealEntry | undefined {
    return currentPlan?.entries.find(
      (e) => e.dayOfWeek === dayOfWeek && e.mealType === mealType
    );
  }

  const mealsPlanned = currentPlan?.entries.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Meal Planner</h1>
          <p className="text-muted-foreground text-sm mt-0.5">
            {mealsPlanned > 0
              ? `${mealsPlanned} meal${mealsPlanned !== 1 ? "s" : ""} planned this week`
              : "Drag meals between slots or click + to add"}
          </p>
        </div>
        <WeekNavigator
          weekStart={currentWeekStart}
          onPrev={() => loadWeek(prevWeek(currentWeekStart))}
          onNext={() => loadWeek(nextWeek(currentWeekStart))}
          onToday={() => loadWeek(getWeekStart())}
          isLoading={isLoading}
        />
      </div>

      {/* Calendar grid */}
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="overflow-x-auto -mx-6 px-6 pb-2">
          <div className="min-w-[640px]">
            {/* Day headers */}
            <div className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 mb-2">
              <div />
              {DISPLAY_DAYS.map(({ dayOfWeek, short }) => {
                const date = dateForDay(currentWeekStart, dayOfWeek);
                const today = isToday(date);
                return (
                  <div key={dayOfWeek} className="text-center">
                    <p
                      className={cn(
                        "text-xs font-semibold uppercase tracking-wide",
                        today ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {short}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-bold mt-0.5 w-7 h-7 rounded-full flex items-center justify-center mx-auto",
                        today && "bg-primary text-primary-foreground"
                      )}
                    >
                      {format(date, "d")}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Meal type rows */}
            {isLoading ? (
              <PlannerSkeleton />
            ) : (
              MEAL_TYPES.map((mealType) => (
                <div key={mealType} className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 mb-2">
                  <div className="flex flex-col items-end justify-start pt-2 pr-2">
                    <span className="text-base leading-none">{MEAL_TYPE_ICONS[mealType]}</span>
                    <span className="text-[10px] font-medium text-muted-foreground mt-1 uppercase tracking-wide">
                      {MEAL_TYPE_LABELS[mealType]}
                    </span>
                  </div>
                  {DISPLAY_DAYS.map(({ dayOfWeek }) => {
                    if (!currentPlan?.id) {
                      return (
                        <div
                          key={dayOfWeek}
                          className="min-h-[72px] rounded-lg border-2 border-dashed border-border/50 bg-muted/20 hover:border-border hover:bg-muted/40 transition-all cursor-pointer flex items-center justify-center"
                          onClick={() => openAddSlot(dayOfWeek, mealType)}
                        >
                          <span className="text-muted-foreground/40 text-lg">+</span>
                        </div>
                      );
                    }
                    return (
                      <MealSlot
                        key={dayOfWeek}
                        dayOfWeek={dayOfWeek}
                        mealType={mealType}
                        planId={currentPlan.id}
                        entry={getEntry(dayOfWeek, mealType)}
                        onAdd={openAddSlot}
                        onRemove={handleRemoveEntry}
                      />
                    );
                  })}
                </div>
              ))
            )}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: 150, easing: "cubic-bezier(0.18,0.67,0.6,1.22)" }}>
          {activeDragEntry && (
            <MealCard
              entry={activeDragEntry}
              planId={plan?.id ?? ""}
              onRemove={() => {}}
              isDragOverlay
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Empty state prompt */}
      {!isLoading && mealsPlanned === 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-8 text-center"
        >
          <div className="p-3 rounded-full bg-muted mb-3">
            <UtensilsCrossed className="size-6 text-muted-foreground" />
          </div>
          <p className="text-sm font-medium">No meals planned this week</p>
          <p className="text-xs text-muted-foreground mt-1">
            Click any + slot to add a meal or create a new one
          </p>
        </motion.div>
      )}

      {slotDialog && (
        <AddToSlotDialog
          open={slotDialog.open}
          onOpenChange={(open) => setSlotDialog(open ? slotDialog : null)}
          planId={plan?.id ?? ""}
          dayOfWeek={slotDialog.dayOfWeek}
          mealType={slotDialog.mealType}
          dayLabel={slotDialog.dayLabel}
        />
      )}
    </div>
  );
}

function PlannerSkeleton() {
  return (
    <>
      {MEAL_TYPES.map((mt) => (
        <div key={mt} className="grid grid-cols-[80px_repeat(7,1fr)] gap-2 mb-2">
          <Skeleton className="h-16 w-full rounded-lg" />
          {Array.from({ length: 7 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-lg" />
          ))}
        </div>
      ))}
    </>
  );
}
