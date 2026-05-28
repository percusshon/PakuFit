import { type UserGoalType } from '@/lib/types/recommendation';

export type SummaryGuideDataCompleteness = 'low' | 'medium' | 'high';

export type SummaryGuideReasonCode =
  | 'no_records'
  | 'insufficient_nutrition_input'
  | 'nutrition_summary'
  | 'summary_stability'
  | 'goal_not_set'
  | 'goal_weight_management'
  | 'goal_balanced_meals'
  | 'goal_higher_protein'
  | 'goal_lower_fat'
  | 'goal_convenience_store_friendly';

export type SummaryGuideItem = {
  code: SummaryGuideReasonCode;
  title: string;
  message: string;
  noticeText?: string;
};

export type SummaryGuideContext = {
  mealCount: number;
  estimatedCaloriesTotal: number;
  estimatedProteinTotal: number;
  estimatedFatTotal: number;
  estimatedCarbsTotal: number;
  nutritionInputCount: number;
  goalContext: UserGoalType | null;
};

export type SummaryGuideResult = {
  items: SummaryGuideItem[];
  dataCompleteness: number;
  dataCompletenessLevel: SummaryGuideDataCompleteness;
  cautionText: string;
  isGoalNotSet: boolean;
};
