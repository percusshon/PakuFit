// 実プロバイダ（Anthropic Messages API・vision）による栄養概算。
// ANTHROPIC_API_KEY が設定されているときのみ呼ばれる。SDKは使わず fetch のみ（依存追加なし）。
// 失敗時は呼び出し側（estimate-meal-nutrition.ts）でモックにフォールバックする。

import {
  type EstimateMealPhotoInput,
  type MealPhotoEstimateResult,
  ESTIMATE_NOTICE,
  clampNutrition,
} from '../vision-types';

const DEFAULT_MODEL = 'claude-sonnet-4-6';
const ANTHROPIC_URL = 'https://api.anthropic.com/v1/messages';

const PROMPT = [
  'あなたは料理写真から栄養を概算する補助ツールです。',
  '医療・診断・治療目的の断定は行わず、あくまで「概算」として推定してください。',
  '次のJSONのみを返してください（前後に説明文やコードフェンスを付けない）:',
  '{"label": string, "confidence": number(0..1), "calories": number, "protein_g": number, "fat_g": number, "carbs_g": number, "fiber_g": number, "salt_g": number}',
  'caloriesはkcal、その他はグラム。1食分として現実的な範囲で推定すること。',
].join('\n');

type AnthropicJson = {
  label?: unknown;
  confidence?: unknown;
  calories?: unknown;
  protein_g?: unknown;
  fat_g?: unknown;
  carbs_g?: unknown;
  fiber_g?: unknown;
  salt_g?: unknown;
};

const toBase64 = (bytes: Uint8Array): string => Buffer.from(bytes).toString('base64');

const toNumber = (value: unknown): number => {
  const parsed = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

// 応答テキストから最初のJSONオブジェクトを取り出す（コードフェンス等の混入に耐える）。
const extractJson = (text: string): AnthropicJson => {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1 || end < start) {
    throw new Error('anthropic_vision: no JSON object in response');
  }
  return JSON.parse(text.slice(start, end + 1)) as AnthropicJson;
};

export const estimateWithAnthropic = async (
  input: EstimateMealPhotoInput,
): Promise<MealPhotoEstimateResult> => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('anthropic_vision: ANTHROPIC_API_KEY is not set');
  }

  const model = process.env.PAKUFIT_VISION_MODEL || DEFAULT_MODEL;
  const hintLine = input.hint?.trim() ? `\n参考メモ: ${input.hint.trim()}` : '';

  const response = await fetch(ANTHROPIC_URL, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 400,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: input.mediaType || 'image/jpeg',
                data: toBase64(input.bytes),
              },
            },
            { type: 'text', text: `${PROMPT}${hintLine}` },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`anthropic_vision: HTTP ${response.status} ${body.slice(0, 200)}`);
  }

  const data = (await response.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = (data.content ?? [])
    .filter((part) => part.type === 'text' && typeof part.text === 'string')
    .map((part) => part.text as string)
    .join('\n');

  const parsed = extractJson(text);

  const nutrition = clampNutrition({
    calories: toNumber(parsed.calories),
    protein_g: toNumber(parsed.protein_g),
    fat_g: toNumber(parsed.fat_g),
    carbs_g: toNumber(parsed.carbs_g),
    fiber_g: toNumber(parsed.fiber_g),
    salt_g: toNumber(parsed.salt_g),
  });

  const confidenceRaw = toNumber(parsed.confidence);
  const confidence = Math.min(1, Math.max(0, confidenceRaw > 1 ? confidenceRaw / 100 : confidenceRaw));

  return {
    provider: 'anthropic',
    isMock: false,
    guessedLabel: typeof parsed.label === 'string' && parsed.label.trim() ? parsed.label.trim() : null,
    confidence: Math.round(confidence * 100) / 100,
    nutrition,
    notice: ESTIMATE_NOTICE,
  };
};
