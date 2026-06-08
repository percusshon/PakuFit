import { type MealEntry } from "../types/meal";
import { type NutritionSummary } from "../types/nutrition";
import { type RecommendationGoalContext, type UserGoalType } from "../types/recommendation";

// ログイン不要のデモ表示用サンプルデータ。
// 実データ・本人データではなく、UI を確認してもらうための固定サンプル。
// すべて「概算・目安」であり、医療・診断目的の値ではない。

const DEMO_DATE = "2026-06-08";

export const demoMeals: MealEntry[] = [
  {
    id: "demo-meal-001",
    user_id: "demo-user-id",
    meal_type: "breakfast",
    eaten_at: `${DEMO_DATE}T07:30:00.000Z`,
    title: "おにぎりと味噌汁",
    description: "味噌汁は薄味",
    estimated_calories: 430,
    estimated_protein_g: 12,
    estimated_fat_g: 9,
    estimated_carbs_g: 70,
    estimated_fiber_g: 4,
    estimated_salt_g: 2.5,
    portion_note: "おにぎり1個",
    preparation_note: "コンビニ",
    created_at: `${DEMO_DATE}T07:30:00.000Z`,
    updated_at: `${DEMO_DATE}T07:30:00.000Z`,
  },
  {
    id: "demo-meal-002",
    user_id: "demo-user-id",
    meal_type: "lunch",
    eaten_at: `${DEMO_DATE}T12:15:00.000Z`,
    title: "鶏むね弁当（サラダ付き）",
    description: "サラダのドレッシングは別添え",
    estimated_calories: 620,
    estimated_protein_g: 42,
    estimated_fat_g: 14,
    estimated_carbs_g: 78,
    estimated_fiber_g: 6,
    estimated_salt_g: 2.8,
    portion_note: "1食",
    preparation_note: "外食/弁当",
    created_at: `${DEMO_DATE}T12:15:00.000Z`,
    updated_at: `${DEMO_DATE}T12:15:00.000Z`,
  },
  {
    id: "demo-meal-003",
    user_id: "demo-user-id",
    meal_type: "snack",
    eaten_at: `${DEMO_DATE}T15:20:00.000Z`,
    title: "ギリシャヨーグルト",
    description: null,
    estimated_calories: 120,
    estimated_protein_g: 10,
    estimated_fat_g: 3,
    estimated_carbs_g: 12,
    estimated_fiber_g: 0,
    estimated_salt_g: 0.1,
    portion_note: "1個",
    preparation_note: null,
    created_at: `${DEMO_DATE}T15:20:00.000Z`,
    updated_at: `${DEMO_DATE}T15:20:00.000Z`,
  },
  {
    id: "demo-meal-004",
    user_id: "demo-user-id",
    meal_type: "dinner",
    eaten_at: `${DEMO_DATE}T19:10:00.000Z`,
    title: "鮭の塩焼き定食",
    description: "ご飯は少なめ",
    estimated_calories: 700,
    estimated_protein_g: 38,
    estimated_fat_g: 20,
    estimated_carbs_g: 82,
    estimated_fiber_g: 7,
    estimated_salt_g: 3.0,
    portion_note: "1食",
    preparation_note: "自炊",
    created_at: `${DEMO_DATE}T19:10:00.000Z`,
    updated_at: `${DEMO_DATE}T19:10:00.000Z`,
  },
];

const sumBy = (selector: (meal: MealEntry) => number | null) =>
  demoMeals.reduce((total, meal) => total + (selector(meal) ?? 0), 0);

// demoMeals から集計した、本番 getTodayMealSummary と同じ形のサマリー。
export const demoSummary: NutritionSummary = {
  date: DEMO_DATE,
  meal_count: demoMeals.length,
  estimated_calories_total: sumBy((m) => m.estimated_calories),
  estimated_protein_g_total: sumBy((m) => m.estimated_protein_g),
  estimated_fat_g_total: sumBy((m) => m.estimated_fat_g),
  estimated_carbs_g_total: sumBy((m) => m.estimated_carbs_g),
  estimated_fiber_g_total: sumBy((m) => m.estimated_fiber_g),
  estimated_salt_g_total: sumBy((m) => m.estimated_salt_g),
  nutrition_estimate_input_count: demoMeals.filter(
    (m) =>
      m.estimated_protein_g !== null ||
      m.estimated_fat_g !== null ||
      m.estimated_carbs_g !== null,
  ).length,
};

// デモ用の目標設定（サンプル）。
export const demoGoalType: UserGoalType = "balanced_meals";

export const demoGoalContext: RecommendationGoalContext = {
  goalType: demoGoalType,
  goalCategory: "balanced_meals",
  targetCaloriesPerDay: 2000,
  targetProteinG: 90,
  targetFatG: 55,
  targetCarbsG: 250,
};
