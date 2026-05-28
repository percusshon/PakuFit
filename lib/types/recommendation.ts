export type RecommendationReason = {
  type: "time" | "nutrition" | "budget" | "history";
  description: string;
};

export type RecommendationItem = {
  id: string;
  title: string;
  details: string;
  caloriesRange: string;
  nutritionHint: string;
  safetyNotice: string;
  label: "自炊" | "コンビニ" | "外食";
};

export type RecommendationSection = {
  heading: string;
  items: RecommendationItem[];
  reasons: RecommendationReason[];
};

export type RecommendationPageData = {
  date: string;
  remainingCalories: number;
  focusNutrition: string;
  sections: RecommendationSection[];
};
