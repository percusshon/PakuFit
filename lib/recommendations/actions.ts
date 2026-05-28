'use server';

import { redirect } from 'next/navigation';

import { createServerClientSafe, requireAuthUser } from '@/lib/supabase/server';
import {
  type RecommendationSource,
  type SaveMealRecommendationInput,
  type UserGoalType,
} from '@/lib/types/recommendation';

const MAX_DESCRIPTION_LENGTH = 400;
const MAX_CAUTION_LENGTH = 400;
const RECOMMENDATION_SOURCE: RecommendationSource = 'rule_based';

const clampText = (value: FormDataEntryValue | null, maxLength: number) => {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  return trimmed.slice(0, maxLength);
};

const toNumberOrNull = (value: FormDataEntryValue | null) => {
  if (typeof value !== 'string' || value.trim() === '') {
    return null;
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || Number.isNaN(parsed)) {
    return null;
  }

  return parsed;
};

const toGoalType = (value: string | null): UserGoalType | null => {
  if (!value) {
    return null;
  }

  if (
    value === 'weight_management' ||
    value === 'balanced_meals' ||
    value === 'higher_protein' ||
    value === 'lower_fat' ||
    value === 'convenience_store_friendly'
  ) {
    return value;
  }

  return null;
};

const normalizeSource = (value: string | null): RecommendationSource => {
  if (value === 'rule_based') {
    return value;
  }

  return RECOMMENDATION_SOURCE;
};

const getRecommendationDate = () => {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(new Date());
};

const hasDuplicateSavedRecommendation = async (
  userId: string,
  candidateKey: string,
  recommendationDate: string,
): Promise<boolean> => {
  const supabase = createServerClientSafe();

  const { data, error } = await supabase
    .from('meal_recommendations')
    .select('id')
    .eq('user_id', userId)
    .eq('recommendation_date', recommendationDate)
    .eq('candidate_key', candidateKey)
    .eq('source', RECOMMENDATION_SOURCE)
    .limit(1)
    .maybeSingle();

  if (error) {
    return true;
  }

  return Boolean(data);
};

const parseInput = (formData: FormData): SaveMealRecommendationInput | null => {
  const candidateKey = clampText(formData.get('candidate_key'), 120);
  const candidateTitle = clampText(formData.get('candidate_title'), 120);
  const candidateDescription = clampText(formData.get('candidate_description'), MAX_DESCRIPTION_LENGTH);
  const reasonCode = clampText(formData.get('reason_code'), 80);
  const reasonLabel = clampText(formData.get('reason_label'), 120);
  const cautionText = clampText(formData.get('caution_text'), MAX_CAUTION_LENGTH);
  const goalCategory = toGoalType(clampText(formData.get('goal_category'), 80));
  const dataCompletenessValue = toNumberOrNull(formData.get('data_completeness'));

  const dataCompleteness = dataCompletenessValue === null ? 0 : dataCompletenessValue;

  if (!candidateKey || !candidateTitle || !candidateDescription) {
    return null;
  }

  const snapshotRaw = clampText(formData.get('snapshot'), 1200);
  let snapshot: Record<string, unknown> | null = null;
  if (snapshotRaw) {
    try {
      const parsed = JSON.parse(snapshotRaw);
      if (parsed && typeof parsed === 'object') {
        snapshot = parsed as Record<string, unknown>;
      }
    } catch {
      snapshot = null;
    }
  }

  return {
    candidateKey,
    candidateTitle,
    candidateDescription,
    reasonCode: reasonCode ?? null,
    reasonLabel: reasonLabel ?? null,
    cautionText: cautionText ?? null,
    goalCategory,
    dataCompleteness: Math.max(0, Math.min(1, Number.isFinite(dataCompleteness) ? dataCompleteness : 0)),
    source: normalizeSource(clampText(formData.get('source'), 40)),
    snapshot,
  };
};

export async function saveMealRecommendations(formData: FormData) {
  const user = await requireAuthUser('/login');
  const parsed = parseInput(formData);

  if (!parsed) {
    redirect('/recommendations/history?error=save_failed');
  }

  const supabase = createServerClientSafe();
  const recommendationDate = getRecommendationDate();
  const alreadySaved = await hasDuplicateSavedRecommendation(user.id, parsed.candidateKey, recommendationDate);

  if (alreadySaved) {
    redirect('/recommendations/history?status=already_saved');
  }

  const { error } = await supabase.from('meal_recommendations').insert({
    user_id: user.id,
    recommendation_date: recommendationDate,
    recommendation_type: 'any',
    generated_at: new Date().toISOString(),
    goal_category: parsed.goalCategory,
    data_completeness: parsed.dataCompleteness,
    candidate_key: parsed.candidateKey,
    candidate_name: parsed.candidateTitle,
    explanation: parsed.candidateDescription,
    reason_code: parsed.reasonCode,
    reason_label: parsed.reasonLabel,
    caution_text: parsed.cautionText,
    source: parsed.source,
    snapshot: parsed.snapshot,
  });

  if (error) {
    redirect('/recommendations/history?error=save_failed');
  }

  redirect('/recommendations/history?status=saved');
}
