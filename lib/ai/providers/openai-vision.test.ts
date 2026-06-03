import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { estimateWithOpenAi } from './openai-vision';
import { NUTRITION_BOUNDS, type EstimateMealPhotoInput } from '../vision-types';

const sampleInput = (overrides: Partial<EstimateMealPhotoInput> = {}): EstimateMealPhotoInput => ({
  bytes: new Uint8Array([10, 20, 30, 40]),
  mediaType: 'image/jpeg',
  filename: 'lunch.jpg',
  ...overrides,
});

// choices[0].message.content に content を載せた擬似 OpenAI 応答を返す fetch を仕込む。
const mockFetch = (content: string, ok = true, status = 200) => {
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => ({
      ok,
      status,
      json: async () => ({ choices: [{ message: { content } }] }),
      text: async () => content,
    })),
  );
};

describe('estimateWithOpenAi', () => {
  const originalKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    if (originalKey === undefined) delete process.env.OPENAI_API_KEY;
    else process.env.OPENAI_API_KEY = originalKey;
  });

  it('キー未設定なら例外を投げる', async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(estimateWithOpenAi(sampleInput())).rejects.toThrow(/OPENAI_API_KEY/);
  });

  it('正常なJSON応答を概算結果へ変換する', async () => {
    mockFetch(
      JSON.stringify({
        label: 'カレーライス',
        confidence: 0.7,
        calories: 650,
        protein_g: 18,
        fat_g: 20,
        carbs_g: 90,
        fiber_g: 5,
        salt_g: 2.5,
      }),
    );

    const result = await estimateWithOpenAi(sampleInput());
    expect(result.provider).toBe('openai');
    expect(result.isMock).toBe(false);
    expect(result.guessedLabel).toBe('カレーライス');
    expect(result.confidence).toBe(0.7);
    expect(result.nutrition.calories).toBe(650);
    expect(result.nutrition.salt_g).toBe(2.5);
  });

  it('0..100 で返る信頼度を 0..1 に正規化する', async () => {
    mockFetch(JSON.stringify({ label: 'ラーメン', confidence: 85, calories: 500 }));
    const result = await estimateWithOpenAi(sampleInput());
    expect(result.confidence).toBe(0.85);
  });

  it('範囲外の概算値はクランプされる', async () => {
    mockFetch(JSON.stringify({ label: 'もり', confidence: 0.5, calories: 99999, protein_g: -5 }));
    const result = await estimateWithOpenAi(sampleInput());
    expect(result.nutrition.calories).toBe(NUTRITION_BOUNDS.calories.max);
    expect(result.nutrition.protein_g).toBe(NUTRITION_BOUNDS.protein_g.min);
  });

  it('コードフェンス等が混入してもJSONを抽出する', async () => {
    mockFetch('```json\n{"label":"そば","confidence":0.4,"calories":420}\n```');
    const result = await estimateWithOpenAi(sampleInput());
    expect(result.guessedLabel).toBe('そば');
    expect(result.nutrition.calories).toBe(420);
  });

  it('HTTPエラー応答では例外を投げる（呼び出し側でモックfallback）', async () => {
    mockFetch('rate limited', false, 429);
    await expect(estimateWithOpenAi(sampleInput())).rejects.toThrow(/HTTP 429/);
  });
});
