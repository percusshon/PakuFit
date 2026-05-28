export type NutritionEstimateMethod = "manual" | "photo" | "barcode" | "import";

export type NutritionEstimate = {
  id: string;
  user_id: string;
  meal_entry_id: string;
  estimated_calories: number | null;
  estimated_protein_g: number | null;
  estimated_fat_g: number | null;
  estimated_carbs_g: number | null;
  estimated_fiber_g: number | null;
  estimated_salt_g: number | null;
  estimate_method: NutritionEstimateMethod;
  is_user_confirmed: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateNutritionEstimateInput = {
  meal_entry_id: string;
  estimated_calories: number | null;
  estimated_protein_g: number | null;
  estimated_fat_g: number | null;
  estimated_carbs_g: number | null;
  estimated_fiber_g: number | null;
  estimated_salt_g: number | null;
};

export type NutritionSummary = {
  date: string;
  meal_count: number;
  estimated_calories_total: number;
  estimated_protein_g_total: number;
  estimated_fat_g_total: number;
  estimated_carbs_g_total: number;
  estimated_fiber_g_total: number;
  estimated_salt_g_total: number;
  nutrition_estimate_input_count: number;
};
