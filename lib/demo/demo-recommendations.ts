import { type MealRecommendationCandidate, type RecommendationPageData } from "../types/recommendation";

const recommendations: MealRecommendationCandidate[] = [
  {
    id: "rec-01",
    title: "たんぱく質を足しやすい候補",
    category: "protein",
    summary: "鶏むね・魚・豆腐・卵を取りやすい候補として表示します。",
    details: "時間がない日のため、手間が少ない候補を優先しています。",
    nutritionHint: "たんぱく質 15〜30g を目安に扱います。",
    safetyNotice: "体調や食事量に合わせて、次の候補として調整してください。",
    priority: "medium",
    reasonCodes: ["low_protein"],
  },
  {
    id: "rec-02",
    title: "脂質を控えめにしやすい候補",
    category: "fat",
    summary: "脂質を抑えやすい候補として整理します。",
    details: "油分の重なりを避けた組み合わせを想定します。",
    nutritionHint: "脂質目安は食事の目安に合わせて参照してください。",
    safetyNotice: "料理手順や使用油により変動があるため、参考値として扱ってください。",
    priority: "low",
    reasonCodes: ["high_fat"],
  },
];

export const demoRecommendations: RecommendationPageData = {
  date: "2026-05-28",
  remainingCalories: 1210,
  focusNutrition: "たんぱく質と野菜のバランスを取りやすい候補",
  candidates: recommendations,
};
