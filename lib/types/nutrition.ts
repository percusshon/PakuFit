export type NutritionEstimate = {
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
};

export type NutritionEstimateConfidence = "low" | "middle" | "high";

export type EstimatedFood = NutritionEstimate & {
  confidence: NutritionEstimateConfidence;
};

export type DailyNutritionSummary = {
  calories: number;
  proteinG: number;
  fatG: number;
  carbG: number;
  remainingCalories: number;
  remainingProteinG: number;
  remainingFatG: number;
  remainingCarbG: number;
};
