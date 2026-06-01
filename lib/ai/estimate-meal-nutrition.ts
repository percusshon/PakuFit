// 写真からの栄養概算のエントリポイント。
// プロバイダ選択ルール:
//   - PAKUFIT_VISION_PROVIDER=anthropic、または未指定でも ANTHROPIC_API_KEY があれば実AIを試す
//   - それ以外はモック
//   - 実AI呼び出しが失敗した場合はモックにフォールバック（UI/保存を止めない）

import { type EstimateMealPhotoInput, type MealPhotoEstimateResult } from './vision-types';
import { estimateWithMock } from './providers/mock-vision';
import { estimateWithAnthropic } from './providers/anthropic-vision';

const shouldUseAnthropic = (): boolean => {
  const provider = (process.env.PAKUFIT_VISION_PROVIDER ?? '').trim().toLowerCase();
  if (provider === 'mock') return false;
  if (provider === 'anthropic') return true;
  // 明示指定がない場合はキーの有無で判断する。
  return Boolean(process.env.ANTHROPIC_API_KEY);
};

export const estimateMealNutritionFromPhoto = async (
  input: EstimateMealPhotoInput,
): Promise<MealPhotoEstimateResult> => {
  if (shouldUseAnthropic() && process.env.ANTHROPIC_API_KEY) {
    try {
      return await estimateWithAnthropic(input);
    } catch (error) {
      // 実AI失敗時はモックへフォールバックし、その旨を注記する。
      if (process.env.NODE_ENV !== 'production') {
        console.warn('PakuFit vision: anthropic failed, falling back to mock ->', error);
      }
      const fallback = estimateWithMock(input);
      return {
        ...fallback,
        notice: `${fallback.notice}（AI接続に失敗したため概算モックにフォールバックしました）`,
      };
    }
  }

  return estimateWithMock(input);
};
