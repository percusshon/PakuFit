import { createServerClientSafe } from '@/lib/supabase/server';
import { requireAuthUser } from '@/lib/supabase/server';
import { type RecommendationGoalContext, type UserGoalType } from '@/lib/types/recommendation';

type UserGoalRow = {
  id: string;
  goal_category: string;
  target_calories_per_day: number | null;
  target_protein_g: number | null;
  target_fat_g: number | null;
  target_carbs_g: number | null;
  is_active: boolean | null;
  updated_at: string;
};

const toGoalType = (goalCategory: string): UserGoalType | null => {
  if (goalCategory === 'weight_management') {
    return 'weight_management';
  }
  if (goalCategory === 'balance_improvement') {
    return 'balanced_meals';
  }
  if (goalCategory === 'protein_focus') {
    return 'higher_protein';
  }
  if (goalCategory === 'fat_moderation') {
    return 'lower_fat';
  }
  if (goalCategory === 'convenience_balance') {
    return 'convenience_store_friendly';
  }

  if (
    goalCategory === 'balanced_meals' ||
    goalCategory === 'higher_protein' ||
    goalCategory === 'lower_fat' ||
    goalCategory === 'convenience_store_friendly'
  ) {
    return goalCategory;
  }

  return null;
};

const normalizeTargetNumber = (value: number | null) => {
  if (value === null) {
    return null;
  }

  return Number(value);
};

export async function getCurrentUserGoal(): Promise<RecommendationGoalContext | null> {
  const user = await requireAuthUser('/login');
  const supabase = createServerClientSafe();

  const { data: goals, error } = await supabase
    .from('user_goals')
    .select('id, goal_category, target_calories_per_day, target_protein_g, target_fat_g, target_carbs_g, is_active, updated_at')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('updated_at', { ascending: false })
    .limit(1);

  if (error || !goals || goals.length === 0) {
    return null;
  }

  const typedGoal = goals[0] as UserGoalRow;
  const goalType = toGoalType(typedGoal.goal_category);

  if (!goalType) {
    return null;
  }

  return {
    goalType,
    goalCategory: typedGoal.goal_category,
    targetCaloriesPerDay: normalizeTargetNumber(typedGoal.target_calories_per_day),
    targetProteinG: normalizeTargetNumber(typedGoal.target_protein_g),
    targetFatG: normalizeTargetNumber(typedGoal.target_fat_g),
    targetCarbsG: normalizeTargetNumber(typedGoal.target_carbs_g),
  };
}
