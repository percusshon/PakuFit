export type MealType = "breakfast" | "lunch" | "dinner" | "snack" | "other";

export type MealEntry = {
  id: string;
  user_id: string;
  meal_type: MealType;
  eaten_at: string;
  title: string;
  description: string | null;
  estimated_calories: number | null;
  estimated_protein_g: number | null;
  estimated_fat_g: number | null;
  estimated_carbs_g: number | null;
  estimated_fiber_g: number | null;
  estimated_salt_g: number | null;
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
  estimated_protein_g?: number | null;
  estimated_fat_g?: number | null;
  estimated_carbs_g?: number | null;
  estimated_fiber_g?: number | null;
  estimated_salt_g?: number | null;
  portion_note?: string | null;
  preparation_note?: string | null;
};
