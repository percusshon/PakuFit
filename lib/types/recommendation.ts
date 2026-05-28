export type RecommendationPriority = "high" | "medium" | "low";

export type UserGoalType =
  | "weight_management"
  | "balanced_meals"
  | "higher_protein"
  | "lower_fat"
  | "convenience_store_friendly";

export type RecommendationGoalContext = {
  goalType: UserGoalType;
  goalCategory: string;
  targetCaloriesPerDay: number | null;
  targetProteinG: number | null;
  targetFatG: number | null;
  targetCarbsG: number | null;
};

export type RecommendationReasonCode =
  | "no_records"
  | "insufficient_pfc_input"
  | "low_protein"
  | "high_fat"
  | "low_carbs"
  | "evening"
  | "balanced_goal"
  | "goal_context"
  | "general";

export type RecommendationReason = {
  code: RecommendationReasonCode;
  label: string;
  description: string;
};

export type MealRecommendationCandidate = {
  id: string;
  title: string;
  category: "protein" | "fat" | "carb" | "timing" | "general";
  summary: string;
  details: string;
  nutritionHint: string;
  safetyNotice: string;
  priority: RecommendationPriority;
  reasonCodes: RecommendationReasonCode[];
};

export type RecommendationContext = {
  mealCount: number;
  estimatedCaloriesTotal: number;
  estimatedProteinTotal: number;
  estimatedFatTotal: number;
  estimatedCarbsTotal: number;
  nutritionInputCount: number;
  now: Date;
  goalContext?: RecommendationGoalContext | null;
};

export type RecommendationResult = {
  candidates: MealRecommendationCandidate[];
  reasons: RecommendationReason[];
  notices: string[];
  dataCompleteness: number;
  source: "rule_based";
};

export type RecommendationPageData = {
  date: string;
  remainingCalories: number;
  focusNutrition: string;
  candidates: MealRecommendationCandidate[];
};
