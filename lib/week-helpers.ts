import { startOfWeek, endOfWeek, addWeeks, subWeeks, format, addDays } from "date-fns";

export function getWeekStart(date: Date = new Date()): Date {
  return startOfWeek(date, { weekStartsOn: 1 });
}

export function getWeekEnd(date: Date = new Date()): Date {
  return endOfWeek(date, { weekStartsOn: 1 });
}

export function nextWeek(weekStart: Date): Date {
  return addWeeks(weekStart, 1);
}

export function prevWeek(weekStart: Date): Date {
  return subWeeks(weekStart, 1);
}

export function weekLabel(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  const sameMonth = format(weekStart, "MMM") === format(end, "MMM");
  if (sameMonth) {
    return `${format(weekStart, "MMM d")} – ${format(end, "d, yyyy")}`;
  }
  return `${format(weekStart, "MMM d")} – ${format(end, "MMM d, yyyy")}`;
}

export function toISODate(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

// DB dayOfWeek: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
// Display order: Mon=1 … Sat=6, Sun=0
export const DISPLAY_DAYS: { dayOfWeek: number; short: string; long: string }[] = [
  { dayOfWeek: 1, short: "Mon", long: "Monday" },
  { dayOfWeek: 2, short: "Tue", long: "Tuesday" },
  { dayOfWeek: 3, short: "Wed", long: "Wednesday" },
  { dayOfWeek: 4, short: "Thu", long: "Thursday" },
  { dayOfWeek: 5, short: "Fri", long: "Friday" },
  { dayOfWeek: 6, short: "Sat", long: "Saturday" },
  { dayOfWeek: 0, short: "Sun", long: "Sunday" },
];

export const MEAL_TYPES = ["BREAKFAST", "LUNCH", "DINNER"] as const;
export type MealTypeKey = (typeof MEAL_TYPES)[number];

export const MEAL_TYPE_LABELS: Record<MealTypeKey, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  DINNER: "Dinner",
};

export const MEAL_TYPE_ICONS: Record<MealTypeKey, string> = {
  BREAKFAST: "☀️",
  LUNCH: "🌤️",
  DINNER: "🌙",
};

// Returns the calendar date for a given dayOfWeek in a week starting on weekStart (Monday)
export function dateForDay(weekStart: Date, dayOfWeek: number): Date {
  // weekStart is Monday (dayOfWeek=1 in our DB convention)
  // Offset: Mon=0, Tue=1, Wed=2, Thu=3, Fri=4, Sat=5, Sun=6
  const offsetMap: Record<number, number> = { 1: 0, 2: 1, 3: 2, 4: 3, 5: 4, 6: 5, 0: 6 };
  return addDays(weekStart, offsetMap[dayOfWeek] ?? 0);
}
