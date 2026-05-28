import { RecommendationPageData } from "../types/recommendation";

export const demoRecommendations: RecommendationPageData = {
  date: "2026-05-28",
  remainingCalories: 1210,
  focusNutrition: "たんぱく質と野菜のバランスを取りやすい候補",
  sections: [
    {
      heading: "自炊で整える候補",
      reasons: [
        { type: "nutrition", description: "たんぱく質不足を補いやすい構成" },
        { type: "time", description: "夕食時刻に向けた軽めの構成" }
      ],
      items: [
        {
          id: "rec-01",
          title: "蒸し鶏のサラダボウル + ひじき煮",
          details: "時間がない日のため前処理しやすい手順に整理できます。",
          caloriesRange: "350〜450 kcal",
          nutritionHint: "たんぱく質 18〜24g、炭水化物 30〜40g程度を想定",
          safetyNotice: "食べる分量は日中の残量とお体調に合わせて調整してください。",
          label: "自炊"
        }
      ]
    },
    {
      heading: "コンビニで選ぶ候補",
      reasons: [
        { type: "budget", description: "価格と入手しやすさのバランスを重視" },
        { type: "history", description: "同日中に取った食事の量と偏りを踏まえる" }
      ],
      items: [
        {
          id: "rec-02",
          title: "おにぎり（魚系） + 温かいスープ + サラダ",
          details: "コンビニ想定の候補として、1食の負荷を抑えた選択肢です。",
          caloriesRange: "500〜700 kcal",
          nutritionHint: "たんぱく質 15〜20g、脂質 12〜18g程度を想定",
          safetyNotice: "甘味の強い飲料や菓子とは分けて、体感と合わせて選んでください。",
          label: "コンビニ"
        }
      ]
    },
    {
      heading: "外食で整える候補",
      reasons: [
        { type: "history", description: "忙しい日の代替候補として現実的な内容" },
        { type: "budget", description: "目安内で選びやすい構成" }
      ],
      items: [
        {
          id: "rec-03",
          title: "定食（焼き魚） + 野菜料理 + ごはん少なめ",
          details: "塩分や脂質の印象が変化する可能性があるため、調味の量を確認してください。",
          caloriesRange: "550〜750 kcal",
          nutritionHint: "たんぱく質 20〜30g、炭水化物 60〜80g程度を想定",
          safetyNotice: "「必ず食べる」ではなく次の候補の一つとして比較してください。",
          label: "外食"
        }
      ]
    }
  ]
};
