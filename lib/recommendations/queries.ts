import { createServerClientSafe, requireAuthUser } from '@/lib/supabase/server';
import { type SavedMealRecommendation } from '@/lib/types/recommendation';

type SavedMealRecommendationRow = {
  id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  recommendation_date: string;
  generated_at: string;
  goal_category: string | null;
  data_completeness: number | string | null;
  candidate_key: string | null;
  candidate_name: string | null;
  explanation: string | null;
  reason_code: string | null;
  reason_label: string | null;
  caution_text: string | null;
  source: string | null;
};

const toNumberOrNull = (value: number | string | null | undefined) => {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  const parsed = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

const toStringOrNull = (value: string | null | undefined) => {
  if (value === null || value === undefined) {
    return null;
  }
  return value;
};

const toRecommendationDate = (value: string | null | undefined, createdAt: string) => {
  return value && value.length > 0 ? value : createdAt.slice(0, 10);
};

export async function getSavedMealRecommendations(): Promise<SavedMealRecommendation[]> {
  const user = await requireAuthUser('/login');
  const supabase = createServerClientSafe();

  const { data, error } = await supabase
    .from('meal_recommendations')
    .select(
      'id, user_id, created_at, updated_at, recommendation_date, generated_at, goal_category, data_completeness, candidate_key, candidate_name, explanation, reason_code, reason_label, caution_text, source',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(50);

  if (error || !data) {
    return [];
  }

  return data.map((row) => {
    const typed = row as SavedMealRecommendationRow;
    const dataCompleteness = toNumberOrNull(typed.data_completeness);

    return {
      id: typed.id,
      user_id: typed.user_id,
      recommendation_date: toRecommendationDate(typed.recommendation_date, typed.created_at),
      generated_at: toStringOrNull(typed.generated_at) || typed.created_at,
      goal_category: (typed.goal_category as SavedMealRecommendation['goal_category']) || null,
      data_completeness: dataCompleteness ?? 0,
      candidate_key: toStringOrNull(typed.candidate_key) || 'manual',
      candidate_title: toStringOrNull(typed.candidate_name) || '',
      candidate_description: toStringOrNull(typed.explanation) || '',
      reason_code: toStringOrNull(typed.reason_code),
      reason_label: toStringOrNull(typed.reason_label),
      caution_text: toStringOrNull(typed.caution_text),
      source: toStringOrNull(typed.source) === 'rule_based' ? 'rule_based' : 'rule_based',
      snapshot: null,
    };
  });
}
