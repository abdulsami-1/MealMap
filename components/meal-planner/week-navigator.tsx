"use client";

import { ChevronLeft, ChevronRight, CalendarDays } from "lucide-react";
import { Button } from "@/components/ui/button";
import { weekLabel, toISODate, getWeekStart } from "@/lib/week-helpers";
import { cn } from "@/lib/utils";
import { isSameWeek } from "date-fns";

interface WeekNavigatorProps {
  weekStart: Date;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
  isLoading?: boolean;
}

export function WeekNavigator({ weekStart, onPrev, onNext, onToday, isLoading }: WeekNavigatorProps) {
  const isCurrentWeek = isSameWeek(weekStart, new Date(), { weekStartsOn: 1 });

  return (
    <div className="flex items-center gap-3">
      <Button variant="outline" size="icon" onClick={onPrev} disabled={isLoading}>
        <ChevronLeft className="size-4" />
      </Button>

      <div className="flex items-center gap-2 min-w-[200px] justify-center">
        <CalendarDays className="size-4 text-muted-foreground shrink-0" />
        <span className={cn("text-sm font-medium", isLoading && "opacity-50")}>
          {weekLabel(weekStart)}
        </span>
      </div>

      <Button variant="outline" size="icon" onClick={onNext} disabled={isLoading}>
        <ChevronRight className="size-4" />
      </Button>

      {!isCurrentWeek && (
        <Button variant="ghost" size="sm" onClick={onToday} disabled={isLoading}>
          Today
        </Button>
      )}
    </div>
  );
}
