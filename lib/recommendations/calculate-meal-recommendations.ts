import {
  type RecommendationContext,
  type RecommendationReason,
  type RecommendationResult,
  type MealRecommendationCandidate,
  RecommendationReasonCode,
} from '@/lib/types/recommendation';

const BASE_NOTICES = [
  '本ページは固定ルールによる一般的な食事管理の参考候補です。',
  '体調や持病、通院中の方は必要に応じて医療従事者に相談してください。',
  '極端な制限を促すものではありません。',
];

const addReason = (reasons: RecommendationReason[], code: RecommendationReasonCode, label: string, description: string) => {
  reasons.push({ code, label, description });
};

const createReason = (
  code: RecommendationReasonCode,
  label: string,
  description: string,
): RecommendationReason => ({
  code,
  label,
  description,
});

const createCandidate = (
  params: Pick<
    MealRecommendationCandidate,
    'id' | 'title' | 'category' | 'summary' | 'details' | 'nutritionHint' | 'safetyNotice' | 'priority' | 'reasonCodes'
  >,
): MealRecommendationCandidate => ({
  ...params,
});

const toPercent = (value: number) => {
  return `${Math.max(0, Math.min(1, value)) * 100 | 0}%`;
};

const formatDataCompleteness = (mealCount: number, nutritionInputCount: number) => {
  if (mealCount <= 0) return 0;
  const ratio = nutritionInputCount / mealCount;
  return Number((0.35 + ratio * 0.55).toFixed(2));
};

const addGeneralMissingDataNotice = (
  context: RecommendationContext,
  reasons: RecommendationReason[],
  notices: string[],
  candidates: MealRecommendationCandidate[],
) => {
  if (context.estimatedCaloriesTotal <= 0) {
    addReason(
      reasons,
      'insufficient_pfc_input',
      '概算カロリー情報が少ない',
      'カロリー入力が未確定のため候補は目安として扱ってください。',
    );
    notices.push('概算カロリー・PFC入力が未入力だと候補の参考精度は限定的です。');
  }

  if (context.nutritionInputCount <= 0) {
    addReason(
      reasons,
      'insufficient_pfc_input',
      'PFC未入力が多い',
      'PFC情報が未入力のため、候補は簡易的な参考表現です。',
    );
    notices.push('PFCの任意入力が未入力だと、候補の参考精度が下がります。');
    candidates.push(
      createCandidate({
        id: 'rule-no-nutrition-input',
        title: '候補の精度を上げるための記録',
        category: 'general',
        summary: '次回からたんぱく質・脂質・炭水化物の任意入力を併記すると、候補の根拠が揃います。',
        details: '記録が多いほど候補の参考情報は見やすくなります。',
        nutritionHint: 'ユーザー入力値ベースの概算です。',
        safetyNotice: '情報は近似で、最終判断は実生活の状況で行ってください。',
        priority: 'high',
        reasonCodes: ['insufficient_pfc_input'],
      }),
    );
  }
};

export const calculateMealRecommendations = (context: RecommendationContext): RecommendationResult => {
  const normalizedNow = context.now instanceof Date ? context.now : new Date();
  const hour = normalizedNow.getHours();
  const mealCount = Math.max(0, Math.trunc(context.mealCount));
  const nutritionInputCount = Math.max(0, Math.trunc(context.nutritionInputCount));
  const candidates: MealRecommendationCandidate[] = [];
  const reasons: RecommendationReason[] = [];
  const notices = [...BASE_NOTICES];

  const dataCompleteness = mealCount === 0 ? 0.15 : formatDataCompleteness(mealCount, nutritionInputCount);

  if (mealCount <= 0) {
    notices.push('まずは1件の食事記録を保存すると、候補の表示が進みます。');
    addReason(reasons, 'no_records', 'まだ未記録', '今日の記録がまだありません。');

    candidates.push(
      createCandidate({
        id: 'rule-no-record',
        title: 'まずは今日の食事を1件記録',
        category: 'general',
        summary: '次の食事候補を出すために、まずは1件の食事ログを保存してください。',
        details: '食事名・食べた時間・概算カロリーを保存すると、候補が増えます。',
        nutritionHint: 'カロリー/PFCは概算で、ユーザー確認が必要です。',
        safetyNotice: '候補は指示ではなく、記録の次の選択肢として使ってください。',
        priority: 'high',
        reasonCodes: ['no_records'],
      }),
    );

    return {
      candidates,
      reasons,
      notices,
      dataCompleteness,
      source: 'rule_based',
    };
  }

  if (context.estimatedProteinTotal < 20 + mealCount * 5) {
    addReason(
      reasons,
      'low_protein',
      'たんぱく質が少なめ',
      'たんぱく質が少なめに見えるため、補いやすい候補を追加します。',
    );
    candidates.push(
      createCandidate({
        id: 'rule-protein',
        title: 'たんぱく質を足しやすい候補',
        category: 'protein',
        summary: '鶏むね・魚・卵・豆腐・ギリシャヨーグルト系など、たんぱく質を補いやすいカテゴリです。',
        details: '1食の中で軽量に加えやすい候補として提示します。',
        nutritionHint: 'たんぱく質目安: 15〜30g / 食事',
        safetyNotice: '必要量は体調や活動量で変わるため、参考として扱ってください。',
        priority: 'high',
        reasonCodes: ['low_protein'],
      }),
    );
  }

  const fatRatio = context.estimatedFatTotal > 0 && context.estimatedCaloriesTotal > 0
    ? (context.estimatedFatTotal * 9) / context.estimatedCaloriesTotal
    : 0;
  if (fatRatio > 0.4 || context.estimatedFatTotal > 70) {
    addReason(
      reasons,
      'high_fat',
      '脂質がやや高め',
      '脂質推定が高めの記録傾向のため、控えめ寄りの選択肢を重視します。',
    );
    candidates.push(
      createCandidate({
        id: 'rule-fat',
        title: '脂質を控えめにしやすい候補',
        category: 'fat',
        summary: '焼き魚・蒸し鶏・豆腐・具だくさん味噌汁・そば系などをベースにした候補です。',
        details: '脂質の高めな食事が続いている場合の参考候補です。',
        nutritionHint: '脂質の目安を抑えやすい選択肢として表示します。',
        safetyNotice: '料理の油量や食べた割合で実態は変わります。',
        priority: 'medium',
        reasonCodes: ['high_fat'],
      }),
    );
  }

  const carbsPerMealAverage = context.estimatedCarbsTotal / mealCount;
  if (context.estimatedCarbsTotal < 80 || carbsPerMealAverage < 18) {
    addReason(
      reasons,
      'low_carbs',
      '炭水化物が少なめ',
      '主食の補完候補を含めた表示を追加します。',
    );
    candidates.push(
      createCandidate({
        id: 'rule-carb',
        title: '主食を足しやすい候補',
        category: 'carb',
        summary: 'おにぎり・ごはん・そば・芋類・オートミール系などの候補です。',
        details: '食事の間隔と体感に合わせて、次回の補完として選択しやすい形に整理します。',
        nutritionHint: 'エネルギー補完を意識する場合の参考候補です。',
        safetyNotice: '目的ではなく、現在の記録との整合を確認しながら扱ってください。',
        priority: 'medium',
        reasonCodes: ['low_carbs'],
      }),
    );
  }

  if (hour >= 18 && hour <= 23 && mealCount > 0) {
    addReason(
      reasons,
      'evening',
      '時間帯を考慮',
      '時間帯を踏まえて、重くなりにくい候補を追加します。',
    );
    candidates.push(
      createCandidate({
        id: 'rule-evening',
        title: '重すぎない夕食候補',
        category: 'timing',
        summary: '夜に向けて量感を抑えた候補を中心に表示します。',
        details: '食材の煩雑さを下げ、調理しやすさを優先した構成です。',
        nutritionHint: '炭水化物と脂質のバランスを抑えた候補を優先します。',
        safetyNotice: '睡眠・休養に合わせて量感を調整してください。',
        priority: 'low',
        reasonCodes: ['evening'],
      }),
    );
  }

  if (candidates.length === 0) {
    candidates.push(
      createCandidate({
        id: 'rule-general',
        title: 'バランスを取りやすい候補',
        category: 'general',
        summary: '極端に偏らない候補をベースに表示します。',
        details: '現時点の記録から見て、次の食事に合わせやすい候補を参考として提示します。',
        nutritionHint: 'カロリー/PFCは概算の範囲で提示します。',
        safetyNotice: '候補は「次の食事候補」であり、必須ではありません。',
        priority: 'low',
        reasonCodes: ['general'],
      }),
    );
    addReason(reasons, 'general', '入力状況', '現時点の記録から一般的な参考候補を提示します。');
  }

  if (!reasons.some((reason) => reason.code === 'insufficient_pfc_input')) {
    reasons.push(createReason('general', '入力状況', '任意PFC入力は候補表示の参考に使っています。'));
  }

  addGeneralMissingDataNotice(context, reasons, notices, candidates);

  const sortedCandidates = [...candidates].sort((a, b) => {
    const scores: Record<string, number> = { high: 3, medium: 2, low: 1 };
    return scores[b.priority] - scores[a.priority] || a.title.localeCompare(b.title);
  });

  const uniqueCandidates = sortedCandidates.filter((candidate, index, arr) => {
    return arr.findIndex((item) => item.id === candidate.id) === index;
  });

  return {
    candidates: uniqueCandidates,
    reasons,
    notices,
    dataCompleteness,
    source: 'rule_based',
  };
};

export const formatRecommendationCompleteness = (dataCompleteness: number) => {
  const value = Math.max(0, Math.min(1, dataCompleteness));
  return {
    label: toPercent(value),
    value,
  };
};
