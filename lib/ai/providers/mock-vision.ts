// 画像バイト列から決定的に「概算」栄養値を生成するモック推定器。
// 外部APIキー不要。同じ画像なら常に同じ結果を返す（テスト・デモ用途）。

import {
  type EstimateMealPhotoInput,
  type MealNutritionEstimate,
  type MealPhotoEstimateResult,
  ESTIMATE_NOTICE,
  clampNutrition,
} from '../vision-types';

// FNV-1a 32bit ハッシュ。バイト列＋ヒントから決定的なシードを作る。
const fnv1a = (bytes: Uint8Array, extra: string): number => {
  let hash = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i += 1) {
    hash ^= bytes[i];
    hash = Math.imul(hash, 0x01000193);
  }
  for (let i = 0; i < extra.length; i += 1) {
    hash ^= extra.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
};

// シードから 0..1 の擬似乱数列を作る簡易PRNG（mulberry32）。
const mulberry32 = (seed: number) => {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const pick = <T>(rng: () => number, items: ReadonlyArray<T>): T => items[Math.floor(rng() * items.length)];

const lerp = (rng: () => number, min: number, max: number) => min + rng() * (max - min);

const MOCK_LABELS = [
  'ご飯と焼き魚',
  '鶏むね肉のサラダ',
  'パスタとスープ',
  '丼もの',
  '定食（主菜＋副菜）',
  'サンドイッチ',
  'おにぎりと味噌汁',
  'カレーライス',
] as const;

export const estimateWithMock = (input: EstimateMealPhotoInput): MealPhotoEstimateResult => {
  const seed = fnv1a(input.bytes, `${input.filename ?? ''}|${input.hint ?? ''}`);
  const rng = mulberry32(seed);

  // カロリーを基準に、PFCを概ね整合する範囲で散らす。
  const calories = lerp(rng, 250, 850);
  const proteinShare = lerp(rng, 0.15, 0.3); // たんぱく質由来エネルギー比
  const fatShare = lerp(rng, 0.2, 0.35); // 脂質由来エネルギー比
  const carbShare = Math.max(0.2, 1 - proteinShare - fatShare);

  const nutrition: MealNutritionEstimate = clampNutrition({
    calories,
    protein_g: (calories * proteinShare) / 4,
    fat_g: (calories * fatShare) / 9,
    carbs_g: (calories * carbShare) / 4,
    fiber_g: lerp(rng, 1, 9),
    salt_g: lerp(rng, 0.5, 4),
  });

  return {
    provider: 'mock',
    isMock: true,
    guessedLabel: input.hint?.trim() || pick(rng, MOCK_LABELS),
    confidence: Math.round(lerp(rng, 0.4, 0.7) * 100) / 100,
    nutrition,
    notice: `${ESTIMATE_NOTICE}（現在はモック推定です。実AI接続時はより精度が上がります）`,
  };
};
