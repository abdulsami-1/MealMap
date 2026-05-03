import { create } from "zustand";
import type { MealType } from "@prisma/client";

export interface MealEntry {
  id: string;
  mealPlanId: string;
  mealId: string;
  dayOfWeek: number;
  mealType: MealType;
  createdAt: Date;
  meal: {
    id: string;
    name: string;
    description: string | null;
    cuisine: string | null;
    cookingTime: number | null;
    servings: number | null;
    imageUrl: string | null;
    createdById: string;
  };
}

export interface MealPlanData {
  id: string;
  householdId: string;
  weekStart: Date;
  entries: MealEntry[];
}

export interface MealData {
  id: string;
  name: string;
  description: string | null;
  cuisine: string | null;
  cookingTime: number | null;
  servings: number | null;
  imageUrl: string | null;
  createdById: string;
}

interface MealPlanStore {
  plan: MealPlanData | null;
  meals: MealData[];
  weekStart: Date;
  isLoading: boolean;

  setPlan: (plan: MealPlanData | null) => void;
  setMeals: (meals: MealData[]) => void;
  setWeekStart: (date: Date) => void;
  setLoading: (loading: boolean) => void;

  addEntry: (entry: MealEntry) => void;
  removeEntry: (entryId: string) => void;
  moveEntry: (entryId: string, dayOfWeek: number, mealType: MealType) => void;

  addMeal: (meal: MealData) => void;
}

export const useMealPlanStore = create<MealPlanStore>((set) => ({
  plan: null,
  meals: [],
  weekStart: new Date(),
  isLoading: false,

  setPlan: (plan) => set({ plan }),
  setMeals: (meals) => set({ meals }),
  setWeekStart: (weekStart) => set({ weekStart }),
  setLoading: (isLoading) => set({ isLoading }),

  addEntry: (entry) =>
    set((state) => ({
      plan: state.plan
        ? { ...state.plan, entries: [...state.plan.entries, entry] }
        : null,
    })),

  removeEntry: (entryId) =>
    set((state) => ({
      plan: state.plan
        ? {
            ...state.plan,
            entries: state.plan.entries.filter((e) => e.id !== entryId),
          }
        : null,
    })),

  moveEntry: (entryId, dayOfWeek, mealType) =>
    set((state) => ({
      plan: state.plan
        ? {
            ...state.plan,
            entries: state.plan.entries.map((e) =>
              e.id === entryId ? { ...e, dayOfWeek, mealType } : e
            ),
          }
        : null,
    })),

  addMeal: (meal) =>
    set((state) => ({ meals: [meal, ...state.meals] })),
}));
