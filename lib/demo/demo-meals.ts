import { MealEntry } from "../types/meal";

export const demoMeals: MealEntry[] = [
  {
    id: "demo-meal-001",
    date: "2026-05-28",
    slot: "morning",
    note: "食事写真とテキストで記録",
    source: "photo",
    foods: [
      {
        id: "food-001",
        name: "ごはん",
        normalizedName: "白米",
        quantity: 150,
        unit: "g",
        cookingMethod: "炊き上げ",
        eatenRatio: 0.9,
        source: "ai",
        estimated: {
          calories: 250,
          proteinG: 4,
          fatG: 0.4,
          carbG: 55,
          confidence: "middle"
        }
      }
    ],
    totalNutrition: {
      calories: 250,
      proteinG: 4,
      fatG: 0.4,
      carbG: 55
    },
    correctionMemo: "量と食べた割合を確認済み。"
  },
  {
    id: "demo-meal-002",
    date: "2026-05-28",
    slot: "lunch",
    note: "テキスト入力のみ",
    source: "text",
    foods: [
      {
        id: "food-002",
        name: "サラダ",
        normalizedName: "野菜サラダ",
        quantity: 1,
        unit: "dish",
        cookingMethod: "生",
        eatenRatio: 1,
        source: "user",
        estimated: {
          calories: 140,
          proteinG: 3,
          fatG: 6,
          carbG: 15,
          confidence: "high"
        }
      }
    ],
    totalNutrition: {
      calories: 140,
      proteinG: 3,
      fatG: 6,
      carbG: 15
    },
    correctionMemo: "ドレッシングは軽め想定。"
  }
];

export const demoSummary = {
  calories: 390,
  proteinG: 7,
  fatG: 6.4,
  carbG: 70,
  remainingCalories: 1210,
  remainingProteinG: 83,
  remainingFatG: 44,
  remainingCarbG: 165
};
