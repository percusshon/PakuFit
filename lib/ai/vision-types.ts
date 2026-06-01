// PakuFit 写真AI栄養概算の共通型
// カロリー/PFCはあくまで「概算」。医療・診断目的の断定には使わない。

export type MealNutritionEstimate = {
  calories: number;
  protein_g: number;
  fat_g: number;
  carbs_g: number;
  fiber_g: number;
  salt_g: number;
};

export type VisionProvider = 'mock' | 'anthropic';

export type MealPhotoEstimateResult = {
  provider: VisionProvider;
  // 実プロバイダ未使用（モック）かどうか。UIで「概算（仮）」表示の判定に使う。
  isMock: boolean;
  // 推定された食事ラベル（例:「ご飯と焼き魚」）。不明なら null。
  guessedLabel: string | null;
  // 0..1 の概算信頼度。MVPでは表示の目安。
  confidence: number;
  nutrition: MealNutritionEstimate;
  // ユーザー向けの注意書き（概算である旨）。
  notice: string;
};

export type EstimateMealPhotoInput = {
  bytes: Uint8Array;
  mediaType: string;
  filename?: string | null;
  // 任意のテキストヒント（食事名メモなど）。推定の補助に使う。
  hint?: string | null;
};

// 概算値が現実的な範囲に収まるようにクランプする。
export const NUTRITION_BOUNDS = {
  calories: { min: 0, max: 5000 },
  protein_g: { min: 0, max: 500 },
  fat_g: { min: 0, max: 500 },
  carbs_g: { min: 0, max: 500 },
  fiber_g: { min: 0, max: 100 },
  salt_g: { min: 0, max: 50 },
} as const;

const clamp = (value: number, min: number, max: number) => {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
};

export const clampNutrition = (estimate: MealNutritionEstimate): MealNutritionEstimate => ({
  calories: Math.round(clamp(estimate.calories, NUTRITION_BOUNDS.calories.min, NUTRITION_BOUNDS.calories.max)),
  protein_g: roundTenth(clamp(estimate.protein_g, NUTRITION_BOUNDS.protein_g.min, NUTRITION_BOUNDS.protein_g.max)),
  fat_g: roundTenth(clamp(estimate.fat_g, NUTRITION_BOUNDS.fat_g.min, NUTRITION_BOUNDS.fat_g.max)),
  carbs_g: roundTenth(clamp(estimate.carbs_g, NUTRITION_BOUNDS.carbs_g.min, NUTRITION_BOUNDS.carbs_g.max)),
  fiber_g: roundTenth(clamp(estimate.fiber_g, NUTRITION_BOUNDS.fiber_g.min, NUTRITION_BOUNDS.fiber_g.max)),
  salt_g: roundTenth(clamp(estimate.salt_g, NUTRITION_BOUNDS.salt_g.min, NUTRITION_BOUNDS.salt_g.max)),
});

function roundTenth(value: number) {
  return Math.round(value * 10) / 10;
}

export const ESTIMATE_NOTICE =
  'これは写真からの概算値です。実際の値とは異なる場合があるため、必要に応じて補正してください。';
