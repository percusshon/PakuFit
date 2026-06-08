import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { DemoBanner } from "@/components/demo-banner";
import { calculateSummaryGuide } from "@/lib/summary/calculate-summary-guide";
import { type UserGoalType } from "@/lib/types/recommendation";
import { demoMeals, demoSummary, demoGoalType } from "@/lib/demo/demo-meals";

const goalLabelMap: Record<UserGoalType, string> = {
  weight_management: "体重管理を意識",
  balanced_meals: "食事バランス改善",
  higher_protein: "たんぱく質を意識",
  lower_fat: "脂質を控えめ",
  convenience_store_friendly: "外食/コンビニ中心でも整える",
};

export const metadata = {
  title: "デモ: 今日のサマリー / PakuFit",
};

export default function DemoSummaryPage() {
  const summary = demoSummary;
  const summaryGuide = calculateSummaryGuide({
    mealCount: summary.meal_count,
    estimatedCaloriesTotal: summary.estimated_calories_total,
    estimatedProteinTotal: summary.estimated_protein_g_total,
    estimatedFatTotal: summary.estimated_fat_g_total,
    estimatedCarbsTotal: summary.estimated_carbs_g_total,
    nutritionInputCount: summary.nutrition_estimate_input_count,
    goalContext: demoGoalType,
  });
  const latestMeals = demoMeals.slice(0, 5);
  const summaryDate = summary.date;

  return (
    <PageContainer title="今日のサマリー（デモ）" description="サンプルデータの集計表示です。">
      <DemoBanner />

      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          本日（{summaryDate}）の記録を本人データとして集計します。表示値は概算で、任意入力値ベースです。
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">現在の目標</p>
          <p className="mt-1 text-sm text-slate-700">選択中: {goalLabelMap[demoGoalType]}（参考）</p>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm font-semibold text-slate-900">目標に合わせた読み取りガイド</p>
          <p className="mt-1 text-sm text-slate-700">
            データ充足度: {Math.round(summaryGuide.dataCompleteness * 100)}%（
            {summaryGuide.dataCompletenessLevel === "high"
              ? "高め"
              : summaryGuide.dataCompletenessLevel === "medium"
                ? "中間"
                : "低め"}
            ）
          </p>
          <p className="mt-1 text-sm text-amber-700">{summaryGuide.cautionText}</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {summaryGuide.items.map((item) => (
              <li key={item.code + item.title} className="rounded border border-amber-100 bg-amber-50 p-2">
                <p className="font-medium text-amber-900">{item.title}</p>
                <p className="mt-1">{item.message}</p>
                {item.noticeText ? <p className="mt-1 text-xs text-amber-800">{item.noticeText}</p> : null}
              </li>
            ))}
          </ul>
        </section>

        <section className="grid gap-3 sm:grid-cols-2">
          <article className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">食事件数（本日）</p>
            <p className="text-2xl font-bold text-slate-900">{summary.meal_count}件</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">概算カロリー合計</p>
            <p className="text-2xl font-bold text-slate-900">{summary.estimated_calories_total} kcal</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">概算たんぱく質合計</p>
            <p className="text-2xl font-bold text-slate-900">{summary.estimated_protein_g_total} g</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">概算脂質合計</p>
            <p className="text-2xl font-bold text-slate-900">{summary.estimated_fat_g_total} g</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">概算炭水化物合計</p>
            <p className="text-2xl font-bold text-slate-900">{summary.estimated_carbs_g_total} g</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">概算食物繊維合計</p>
            <p className="text-2xl font-bold text-slate-900">{summary.estimated_fiber_g_total} g</p>
          </article>
          <article className="rounded-md border border-slate-200 bg-white p-4">
            <p className="text-sm text-slate-600">概算食塩相当量合計</p>
            <p className="text-2xl font-bold text-slate-900">{summary.estimated_salt_g_total} g</p>
          </article>
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-slate-900">直近の食事（最新5件）</h2>
          <ul className="mt-3 space-y-2 text-sm text-slate-700">
            {latestMeals.map((meal) => (
              <li key={meal.id} className="rounded border border-slate-100 bg-amber-50 p-2">
                {new Date(meal.eaten_at).toLocaleString("ja-JP")} / {meal.title} /{" "}
                {meal.estimated_calories === null ? "カロリー未入力" : `${meal.estimated_calories} kcal`}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">次の食事候補との接続</p>
          <p className="mt-1">
            今日の記録をもとに、固定ルールによる次の食事候補を確認できます。
            <Link href="/demo/recommendations" className="mx-1 font-semibold text-amber-900 underline underline-offset-2">
              次の食事候補（デモ）
            </Link>
            を確認してください。
          </p>
        </section>

        <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          PFCは任意入力値を使った概算の合計です。目標達成判定や減量助言は表示しません。
          PFCの自動計算・写真解析は今後の拡張予定です。
        </p>
      </div>
    </PageContainer>
  );
}
