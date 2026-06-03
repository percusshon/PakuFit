import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { estimateMealNutritionFromPhoto } from './estimate-meal-nutrition';
import { estimateWithMock } from './providers/mock-vision';
import { NUTRITION_BOUNDS, type EstimateMealPhotoInput } from './vision-types';

const sampleInput = (overrides: Partial<EstimateMealPhotoInput> = {}): EstimateMealPhotoInput => ({
  bytes: new Uint8Array([10, 20, 30, 40, 50, 60, 70, 80]),
  mediaType: 'image/jpeg',
  filename: 'lunch.jpg',
  ...overrides,
});

describe('estimateWithMock', () => {
  it('同じ入力に対して決定的に同じ結果を返す', () => {
    const a = estimateWithMock(sampleInput());
    const b = estimateWithMock(sampleInput());
    expect(a).toEqual(b);
  });

  it('入力が変わると結果も変わる', () => {
    const a = estimateWithMock(sampleInput({ bytes: new Uint8Array([1, 2, 3]) }));
    const b = estimateWithMock(sampleInput({ bytes: new Uint8Array([9, 9, 9]) }));
    expect(a.nutrition).not.toEqual(b.nutrition);
  });

  it('概算値はすべて許容範囲に収まる', () => {
    const { nutrition } = estimateWithMock(sampleInput());
    expect(nutrition.calories).toBeGreaterThanOrEqual(NUTRITION_BOUNDS.calories.min);
    expect(nutrition.calories).toBeLessThanOrEqual(NUTRITION_BOUNDS.calories.max);
    expect(nutrition.protein_g).toBeLessThanOrEqual(NUTRITION_BOUNDS.protein_g.max);
    expect(nutrition.fat_g).toBeLessThanOrEqual(NUTRITION_BOUNDS.fat_g.max);
    expect(nutrition.carbs_g).toBeLessThanOrEqual(NUTRITION_BOUNDS.carbs_g.max);
    expect(nutrition.fiber_g).toBeLessThanOrEqual(NUTRITION_BOUNDS.fiber_g.max);
    expect(nutrition.salt_g).toBeLessThanOrEqual(NUTRITION_BOUNDS.salt_g.max);
  });

  it('モック結果は isMock=true で provider=mock', () => {
    const result = estimateWithMock(sampleInput());
    expect(result.isMock).toBe(true);
    expect(result.provider).toBe('mock');
    expect(result.notice).toContain('概算');
  });

  it('ヒントがある場合はラベルに反映される', () => {
    const result = estimateWithMock(sampleInput({ hint: 'カレーライス' }));
    expect(result.guessedLabel).toBe('カレーライス');
  });
});

describe('estimateMealNutritionFromPhoto', () => {
  const originalProvider = process.env.PAKUFIT_VISION_PROVIDER;
  const originalAnthropicKey = process.env.ANTHROPIC_API_KEY;
  const originalOpenAiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    delete process.env.ANTHROPIC_API_KEY;
    delete process.env.OPENAI_API_KEY;
    process.env.PAKUFIT_VISION_PROVIDER = 'mock';
  });

  afterEach(() => {
    if (originalProvider === undefined) delete process.env.PAKUFIT_VISION_PROVIDER;
    else process.env.PAKUFIT_VISION_PROVIDER = originalProvider;
    if (originalAnthropicKey === undefined) delete process.env.ANTHROPIC_API_KEY;
    else process.env.ANTHROPIC_API_KEY = originalAnthropicKey;
    if (originalOpenAiKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalOpenAiKey;
  });

  it('キー未設定・mock指定ならモック推定を返す', async () => {
    const result = await estimateMealNutritionFromPhoto(sampleInput(), { allowExternal: true });
    expect(result.provider).toBe('mock');
    expect(result.isMock).toBe(true);
  });

  it('同意なし(allowExternal未指定)なら外部送信せずモックを返す', async () => {
    process.env.PAKUFIT_VISION_PROVIDER = 'openai';
    process.env.OPENAI_API_KEY = 'test-key';
    const result = await estimateMealNutritionFromPhoto(sampleInput());
    expect(result.provider).toBe('mock');
    expect(result.isMock).toBe(true);
  });

  it('同意あり・openai指定でもキー未設定ならモックにフォールバックする', async () => {
    process.env.PAKUFIT_VISION_PROVIDER = 'openai';
    const result = await estimateMealNutritionFromPhoto(sampleInput(), { allowExternal: true });
    expect(result.provider).toBe('mock');
    expect(result.isMock).toBe(true);
  });
});
