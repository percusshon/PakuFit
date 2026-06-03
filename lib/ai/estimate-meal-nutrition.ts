// 写真からの栄養概算のエントリポイント。
// プロバイダ選択ルール（優先順）:
//   - PAKUFIT_VISION_PROVIDER=mock なら常にモック
//   - PAKUFIT_VISION_PROVIDER=openai、または未指定でも OPENAI_API_KEY があれば OpenAI を試す
//   - PAKUFIT_VISION_PROVIDER=anthropic、または未指定でも ANTHROPIC_API_KEY があれば Anthropic を試す
//   - それ以外はモック
//   - 実AI呼び出しが失敗した場合はモックにフォールバック（UI/保存を止めない）

import { type EstimateMealPhotoInput, type MealPhotoEstimateResult } from './vision-types';
import { estimateWithMock } from './providers/mock-vision';
import { estimateWithAnthropic } from './providers/anthropic-vision';
import { estimateWithOpenAi } from './providers/openai-vision';

type ResolvedProvider = 'mock' | 'anthropic' | 'openai';

// 明示指定とキーの有無から、実際に使うプロバイダを決める。
const resolveProvider = (): ResolvedProvider => {
  const provider = (process.env.PAKUFIT_VISION_PROVIDER ?? '').trim().toLowerCase();
  if (provider === 'mock') return 'mock';
  if (provider === 'openai') return process.env.OPENAI_API_KEY ? 'openai' : 'mock';
  if (provider === 'anthropic') return process.env.ANTHROPIC_API_KEY ? 'anthropic' : 'mock';
  // 明示指定がない場合はキーの有無で判断する（OpenAI を優先）。
  if (process.env.OPENAI_API_KEY) return 'openai';
  if (process.env.ANTHROPIC_API_KEY) return 'anthropic';
  return 'mock';
};

// 実AI失敗時はモックへフォールバックし、その旨を注記する。
const fallbackToMock = (input: EstimateMealPhotoInput, error: unknown): MealPhotoEstimateResult => {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('PakuFit vision: provider failed, falling back to mock ->', error);
  }
  const fallback = estimateWithMock(input);
  return {
    ...fallback,
    notice: `${fallback.notice}（AI接続に失敗したため概算モックにフォールバックしました）`,
  };
};

export const estimateMealNutritionFromPhoto = async (
  input: EstimateMealPhotoInput,
): Promise<MealPhotoEstimateResult> => {
  const provider = resolveProvider();

  if (provider === 'openai') {
    try {
      return await estimateWithOpenAi(input);
    } catch (error) {
      return fallbackToMock(input, error);
    }
  }

  if (provider === 'anthropic') {
    try {
      return await estimateWithAnthropic(input);
    } catch (error) {
      return fallbackToMock(input, error);
    }
  }

  return estimateWithMock(input);
};
