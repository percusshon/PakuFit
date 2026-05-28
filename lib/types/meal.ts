export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export type MealEntry = {
  id: string;
  user_id: string;
  meal_type: MealType;
  eaten_at: string;
  title: string;
  description: string | null;
  estimated_calories: number | null;
  portion_note: string | null;
  preparation_note: string | null;
  created_at: string;
  updated_at: string;
};

export type CreateMealEntryInput = {
  meal_type: MealType;
  eaten_at?: string;
  title: string;
  description?: string | null;
  estimated_calories?: number | null;
  portion_note?: string | null;
  preparation_note?: string | null;
};
