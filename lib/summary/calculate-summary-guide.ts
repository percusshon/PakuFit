import {
  type SummaryGuideContext,
  type SummaryGuideItem,
  type SummaryGuideReasonCode,
  type SummaryGuideResult,
} from '@/lib/types/summary';
import { type UserGoalType } from '@/lib/types/recommendation';

type BuildGuideInput = SummaryGuideContext;

const GOAL_MESSAGES: Record<UserGoalType | 'unset', { title: string; message: string; reasonCode: SummaryGuideReasonCode }> = {
  weight_management: {
    title: '日々の記録を続けやすい読み取り',
    message: '日々の記録を続けやすいように、まずは件数と概算値を確認する流れを保つと、次の候補を見返しやすくなります。',
    reasonCode: 'goal_weight_management',
  },
  balanced_meals: {
    title: 'バランスを取りやすい読み取り',
    message: 'カロリーだけでなくPFCも入力すると、今日の記録を見返しやすくなります。',
    reasonCode: 'goal_balanced_meals',
  },
  higher_protein: {
    title: 'たんぱく質を見やすくする読み取り',
    message: 'たんぱく質の入力があると、次の候補を目安にした読み取りがしやすくなります。',
    reasonCode: 'goal_higher_protein',
  },
  lower_fat: {
    title: '脂質の情報を活かす読み取り',
    message: '脂質の概算入力があると、脂質を控えめにしやすい候補表示へつなげやすくなります。',
    reasonCode: 'goal_lower_fat',
  },
  convenience_store_friendly: {
    title: '外食/コンビニでも使いやすい読み取り',
    message: '外食やコンビニ中心の日も、カテゴリ単位で記録すると振り返りやすくなります。',
    reasonCode: 'goal_convenience_store_friendly',
  },
  unset: {
    title: '目標設定が未登録です',
    message: '目標を登録しておくと「目標に合わせた読み取りガイド」を表示できます。',
    reasonCode: 'goal_not_set',
  },
};

const buildDataCompleteness = (mealCount: number, nutritionInputCount: number) => {
  if (mealCount <= 0) {
    return { score: 0, level: 'low' as const };
  }

  const rate = nutritionInputCount / mealCount;
  const score = Number(Math.max(0, Math.min(1, 0.15 + rate * 0.85)).toFixed(2));
  if (score >= 0.75) {
    return { score, level: 'high' as const };
  }

  if (score >= 0.45) {
    return { score, level: 'medium' as const };
  }

  return { score, level: 'low' as const };
};

const buildNoRecordItem = (): SummaryGuideItem => ({
  code: 'no_records',
  title: 'まずは本日の記録を1件作成',
  message: '今日の記録がないため、読み取りガイドはこれからの記録に向けた案内になります。',
});

const buildPfcInputWarning = (): SummaryGuideItem => ({
  code: 'insufficient_nutrition_input',
  title: 'PFC入力は任意ですが、表示精度に影響',
  message: 'PFC入力が少ないため、傾向の読み取りは参考情報として限定的です。次回保存時にPFCがあると、候補との対応が見やすくなります。',
});

const buildNutritionTrendItem = (context: BuildGuideInput): SummaryGuideItem => {
  const { estimatedProteinTotal, estimatedFatTotal, estimatedCarbsTotal } = context;

  const detail: Array<string> = [];
  detail.push(`概算たんぱく質: ${Math.round(estimatedProteinTotal)}g`);
  detail.push(`概算脂質: ${Math.round(estimatedFatTotal)}g`);
  detail.push(`概算炭水化物: ${Math.round(estimatedCarbsTotal)}g`);

  return {
    code: 'nutrition_summary',
    title: '本日の概算値の見方',
    message: `${detail.join(' / ')}を基準に、次の候補の参考情報として活用できます。`,
  };
};

export function calculateSummaryGuide(context: BuildGuideInput): SummaryGuideResult {
  const { mealCount, nutritionInputCount, goalContext } = context;
  const { score, level } = buildDataCompleteness(mealCount, nutritionInputCount);

  const items: SummaryGuideItem[] = [];
  const isGoalNotSet = goalContext === null;
  const isNutritionInputLimited = mealCount > 0 && nutritionInputCount < Math.max(1, Math.floor(mealCount * 0.5));
  const cautionText = isNutritionInputLimited
    ? 'PFC入力が限定的なため、読み取りはあくまで目安です。'
    : '本日の記録は参考情報として整えると、固定ルールの候補表示を振り返りやすくなります。';

  if (mealCount === 0) {
    items.push(buildNoRecordItem());
  } else {
    items.push(buildNutritionTrendItem(context));
  }

  if (isNutritionInputLimited) {
    items.push(buildPfcInputWarning());
  }

  const goalKey = isGoalNotSet ? 'unset' : goalContext;
  const goalMessage = GOAL_MESSAGES[goalKey];
  items.push({
    code: goalMessage.reasonCode,
    title: goalMessage.title,
    message: goalMessage.message,
  });

  if (mealCount >= 3 && !isNutritionInputLimited) {
    items.push({
      code: 'summary_stability',
      title: 'まとめやすい本日分',
      message: `本日${mealCount}件の概算値が揃っており、固定ルール候補を比較しやすい状態です。`,
      noticeText: '日々の記録を継続し、比較のベースにすると見通しが作りやすくなります。',
    });
  }

  return {
    items,
    dataCompleteness: score,
    dataCompletenessLevel: level,
    cautionText,
    isGoalNotSet,
  };
}
