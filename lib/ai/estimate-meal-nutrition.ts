// 写真からの栄養概算のエントリポイント。
// 外部送信の同意（opt-in）:
//   - allowExternal=false（既定）なら、外部AIサービスへ画像を送らずモックのみ。
//   - allowExternal=true（ユーザーが明示同意したとき）に限り、実プロバイダを試す。
// プロバイダ選択ルール（allowExternal=true のとき / 優先順）:
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

export type EstimateOptions = {
  // ユーザーが外部AIサービスへの画像送信に明示同意したか。既定 false（送信しない）。
  allowExternal?: boolean;
};

export const estimateMealNutritionFromPhoto = async (
  input: EstimateMealPhotoInput,
  options: EstimateOptions = {},
): Promise<MealPhotoEstimateResult> => {
  // 明示同意がない限り外部送信せず、ローカルのモック推定のみを返す。
  if (!options.allowExternal) {
    return estimateWithMock(input);
  }

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
