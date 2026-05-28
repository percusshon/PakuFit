import { describe, expect, it } from 'vitest';
import { calculateMealRecommendations } from './calculate-meal-recommendations';

describe('calculateMealRecommendations', () => {
  it('記録0件の場合は記録導線候補を返す', () => {
    const result = calculateMealRecommendations({
      mealCount: 0,
      estimatedCaloriesTotal: 0,
      estimatedProteinTotal: 0,
      estimatedFatTotal: 0,
      estimatedCarbsTotal: 0,
      nutritionInputCount: 0,
      now: new Date(2026, 0, 1, 10, 0, 0),
    });

    expect(result.candidates.some((candidate) => candidate.id === 'rule-no-record')).toBe(true);
    expect(result.candidates.some((candidate) => candidate.title.includes('1件記録'))).toBe(true);
    expect(result.reasons.some((reason) => reason.code === 'no_records')).toBe(true);
    expect(result.notices.join('\n')).toContain('1件');
  });

  it('PFC未入力が多い場合、dataCompletenessが低下し不確実性文言が返る', () => {
    const result = calculateMealRecommendations({
      mealCount: 3,
      estimatedCaloriesTotal: 900,
      estimatedProteinTotal: 45,
      estimatedFatTotal: 20,
      estimatedCarbsTotal: 120,
      nutritionInputCount: 0,
      now: new Date(2026, 0, 1, 12, 0, 0),
    });

    expect(result.dataCompleteness).toBeLessThan(0.5);
    const joined = result.notices.join('\n') + result.reasons.map((reason) => reason.description).join('\n');
    expect(joined).toContain('未入力');
    expect(joined).toContain('参考');
  });

  it('たんぱく質が少なそうな場合、たんぱく質候補を提示する', () => {
    const result = calculateMealRecommendations({
      mealCount: 2,
      estimatedCaloriesTotal: 1100,
      estimatedProteinTotal: 10,
      estimatedFatTotal: 20,
      estimatedCarbsTotal: 130,
      nutritionInputCount: 2,
      now: new Date(2026, 0, 1, 12, 0, 0),
    });

    expect(result.candidates.some((candidate) => candidate.id === 'rule-protein')).toBe(true);
    expect(result.candidates.some((candidate) => candidate.title.includes('たんぱく質を足しやすい候補'))).toBe(true);
    const allText = JSON.stringify(result);
    expect(allText).not.toContain('必ず');
  });

  it('脂質が高い場合、脂質控えめ候補を提示し健康効果断定を出さない', () => {
    const result = calculateMealRecommendations({
      mealCount: 1,
      estimatedCaloriesTotal: 200,
      estimatedProteinTotal: 10,
      estimatedFatTotal: 15,
      estimatedCarbsTotal: 50,
      nutritionInputCount: 1,
      now: new Date(2026, 0, 1, 12, 0, 0),
    });

    expect(result.candidates.some((candidate) => candidate.id === 'rule-fat')).toBe(true);
    expect(result.candidates.some((candidate) => candidate.title.includes('脂質を控えめにしやすい候補'))).toBe(true);

    const allText = JSON.stringify(result);
    expect(allText).not.toContain('改善');
    expect(allText).not.toContain('健康');
  });

  it('炭水化物が少ない場合、主食候補を提示する', () => {
    const result = calculateMealRecommendations({
      mealCount: 1,
      estimatedCaloriesTotal: 400,
      estimatedProteinTotal: 30,
      estimatedFatTotal: 12,
      estimatedCarbsTotal: 10,
      nutritionInputCount: 1,
      now: new Date(2026, 0, 1, 12, 0, 0),
    });

    expect(result.candidates.some((candidate) => candidate.id === 'rule-carb')).toBe(true);
    expect(result.candidates.some((candidate) => candidate.title.includes('主食を足しやすい候補'))).toBe(true);
    const allText = JSON.stringify(result);
    expect(allText).not.toContain('必ず食べる');
  });

  it('夕方以降は時間帯候補を含める', () => {
    const result = calculateMealRecommendations({
      mealCount: 1,
      estimatedCaloriesTotal: 500,
      estimatedProteinTotal: 35,
      estimatedFatTotal: 15,
      estimatedCarbsTotal: 70,
      nutritionInputCount: 1,
      now: new Date(2026, 0, 1, 20, 0, 0),
    });

    expect(result.candidates.some((candidate) => candidate.id === 'rule-evening')).toBe(true);
    expect(result.candidates.some((candidate) => candidate.title.includes('重すぎない夕食候補'))).toBe(true);
    const text = JSON.stringify(result);
    expect(text).not.toContain('必ず');
  });

  it('推薦文言に禁止表現を含めない', () => {
    const result = calculateMealRecommendations({
      mealCount: 2,
      estimatedCaloriesTotal: 1000,
      estimatedProteinTotal: 10,
      estimatedFatTotal: 18,
      estimatedCarbsTotal: 40,
      nutritionInputCount: 0,
      now: new Date(2026, 0, 1, 19, 0, 0),
    });

    const text = JSON.stringify(result);
    const forbiddenPhrases = [
      '食べるべき',
      '痩せる',
      '脂肪が落ちる',
      '血糖値が改善',
      '病気を防ぐ',
      '治療',
      '診断',
      '疾病改善',
      'AI栄養指導',
    ];

    for (const phrase of forbiddenPhrases) {
      expect(text).not.toContain(phrase);
    }
  });
});
