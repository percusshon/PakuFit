import { describe, expect, it } from 'vitest';
import { calculateSummaryGuide } from './calculate-summary-guide';

describe('calculateSummaryGuide', () => {
  it('目標未設定時に設定導線を促す情報が返る', () => {
    const result = calculateSummaryGuide({
      mealCount: 2,
      estimatedCaloriesTotal: 600,
      estimatedProteinTotal: 20,
      estimatedFatTotal: 12,
      estimatedCarbsTotal: 80,
      nutritionInputCount: 0,
      goalContext: null,
    });

    expect(result.isGoalNotSet).toBe(true);
    expect(result.items.some((item) => item.code === 'goal_not_set')).toBe(true);
    expect(result.cautionText).toContain('限定的');
    const goalMessage = result.items.find((item) => item.code === 'goal_not_set');
    expect(goalMessage?.message).toContain('目標に合わせた読み取りガイド');
  });

  it('higher_protein目標でたんぱく質入力に関するガイドが返る', () => {
    const result = calculateSummaryGuide({
      mealCount: 2,
      estimatedCaloriesTotal: 700,
      estimatedProteinTotal: 25,
      estimatedFatTotal: 18,
      estimatedCarbsTotal: 100,
      nutritionInputCount: 1,
      goalContext: 'higher_protein',
    });

    expect(result.isGoalNotSet).toBe(false);
    expect(result.items.some((item) => item.code === 'goal_higher_protein')).toBe(true);
    expect(result.items.some((item) => item.message.includes('たんぱく質の入力'))).toBe(true);
  });

  it('lower_fat目標で脂質入力に関するガイドが返る', () => {
    const result = calculateSummaryGuide({
      mealCount: 2,
      estimatedCaloriesTotal: 720,
      estimatedProteinTotal: 35,
      estimatedFatTotal: 28,
      estimatedCarbsTotal: 90,
      nutritionInputCount: 2,
      goalContext: 'lower_fat',
    });

    expect(result.items.some((item) => item.code === 'goal_lower_fat')).toBe(true);
    expect(result.items.some((item) => item.message.includes('脂質の概算入力'))).toBe(true);
  });

  it('balanced_meals目標でPFC全体に関するガイドが返る', () => {
    const result = calculateSummaryGuide({
      mealCount: 3,
      estimatedCaloriesTotal: 900,
      estimatedProteinTotal: 28,
      estimatedFatTotal: 21,
      estimatedCarbsTotal: 110,
      nutritionInputCount: 2,
      goalContext: 'balanced_meals',
    });

    expect(result.items.some((item) => item.code === 'goal_balanced_meals')).toBe(true);
    expect(result.items.some((item) => item.message.includes('PFC'))).toBe(true);
    expect(result.items.some((item) => item.code === 'nutrition_summary')).toBe(true);
  });

  it('PFC入力が少ない場合に不確実性文言が返る', () => {
    const result = calculateSummaryGuide({
      mealCount: 3,
      estimatedCaloriesTotal: 900,
      estimatedProteinTotal: 18,
      estimatedFatTotal: 20,
      estimatedCarbsTotal: 95,
      nutritionInputCount: 0,
      goalContext: 'weight_management',
    });

    expect(result.cautionText).toContain('限定的');
    expect(result.items.some((item) => item.code === 'insufficient_nutrition_input')).toBe(true);
    expect(result.dataCompletenessLevel).toBe('low');
  });

  it('記録0件時にまず記録を促すガイドが返る', () => {
    const result = calculateSummaryGuide({
      mealCount: 0,
      estimatedCaloriesTotal: 0,
      estimatedProteinTotal: 0,
      estimatedFatTotal: 0,
      estimatedCarbsTotal: 0,
      nutritionInputCount: 0,
      goalContext: 'convenience_store_friendly',
    });

    expect(result.dataCompleteness).toBe(0);
    expect(result.isGoalNotSet).toBe(false);
    expect(result.items.some((item) => item.code === 'no_records')).toBe(true);
  });

  it('禁止表現を含めない', () => {
    const result = calculateSummaryGuide({
      mealCount: 1,
      estimatedCaloriesTotal: 500,
      estimatedProteinTotal: 10,
      estimatedFatTotal: 8,
      estimatedCarbsTotal: 45,
      nutritionInputCount: 0,
      goalContext: 'weight_management',
    });

    const text = JSON.stringify(result);
    const forbiddenPhrases = [
      '食べるべき',
      '痩せる',
      '減量できる',
      '脂肪が落ちる',
      '血糖値が改善',
      '病気を防ぐ',
      '治療',
      '診断',
      '疾病改善',
    ];

    for (const phrase of forbiddenPhrases) {
      expect(text).not.toContain(phrase);
    }
  });
});
