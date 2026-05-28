import { MealEntry } from "../types/meal";

export const demoMeals: MealEntry[] = [
  {
    id: "demo-meal-001",
    user_id: "demo-user-id",
    meal_type: "breakfast",
    eaten_at: "2026-05-28T07:30:00.000Z",
    title: "おにぎりと味噌汁",
    description: "味噌汁は薄味",
    estimated_calories: 430,
    portion_note: "1個",
    preparation_note: "冷めた状態",
    created_at: "2026-05-28T07:30:00.000Z",
    updated_at: "2026-05-28T07:30:00.000Z",
  },
  {
    id: "demo-meal-002",
    user_id: "demo-user-id",
    meal_type: "snack",
    eaten_at: "2026-05-28T15:20:00.000Z",
    title: "ヨーグルト",
    description: null,
    estimated_calories: null,
    portion_note: null,
    preparation_note: null,
    created_at: "2026-05-28T15:20:00.000Z",
    updated_at: "2026-05-28T15:20:00.000Z",
  },
];

export const demoSummary = {
  calories: 430,
  proteinG: 12,
  fatG: 9,
  carbG: 58,
  remainingCalories: 1570,
  remainingProteinG: 83,
  remainingFatG: 44,
  remainingCarbG: 165,
};
