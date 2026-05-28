import { NutritionEstimate, EstimatedFood } from "./nutrition";

export type FoodSource = "user" | "ai";

export type ServingUnit = "g" | "ml" | "cup" | "serving" | "piece" | "dish";

export type MealTimeSlot = "morning" | "lunch" | "dinner" | "late";

export type MealFoodItem = {
  id: string;
  name: string;
  normalizedName: string;
  quantity: number;
  unit: ServingUnit;
  cookingMethod: string;
  eatenRatio: number;
  source: FoodSource;
  estimated: EstimatedFood;
};

export type MealEntry = {
  id: string;
  date: string;
  slot: MealTimeSlot;
  note: string;
  foods: MealFoodItem[];
  totalNutrition: NutritionEstimate;
  correctionMemo: string;
  source: "photo" | "text";
};

export type CreateMealInput = {
  date: string;
  slot: MealTimeSlot;
  note: string;
  foods: MealFoodItem[];
};
