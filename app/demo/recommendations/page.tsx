import Link from "next/link";

import {
  formatRecommendationCompleteness,
  calculateMealRecommendations,
} from "@/lib/recommendations/calculate-meal-recommendations";
import { type UserGoalType } from "@/lib/types/recommendation";
import { PageContainer } from "@/components/page-container";
import { DemoBanner } from "@/components/demo-banner";
import { demoSummary, demoGoalType, demoGoalContext } from "@/lib/demo/demo-meals";

const goalLabelMap: Record<UserGoalType, string> = {
  weight_management: "体重管理",
  balanced_meals: "食事バランスを整える",
  higher_protein: "たんぱく質を意識",
  lower_fat: "脂質を控えめにしたい",
  convenience_store_friendly: "外食/コンビニ中心でも整える",
};

export const metadata = {
  title: "デモ: 次の食事候補 / PakuFit",
};

export default function DemoRecommendationsPage() {
  const summary = demoSummary;

  const result = calculateMealRecommendations({
    mealCount: summary.meal_count,
    estimatedCaloriesTotal: summary.estimated_calories_total,
    estimatedProteinTotal: summary.estimated_protein_g_total,
    estimatedFatTotal: summary.estimated_fat_g_total,
    estimatedCarbsTotal: summary.estimated_carbs_g_total,
    nutritionInputCount: summary.nutrition_estimate_input_count,
    goalContext: demoGoalContext,
    now: new Date(),
  });

  const completeness = formatRecommendationCompleteness(result.dataCompleteness);
  const goalLabel = goalLabelMap[demoGoalType];

  return (
    <PageContainer title="次の食事候補（デモ）" description="サンプルデータをもとにした参考候補の表示です。">
      <DemoBanner />

      <div className="space-y-3">
        <p className="rounded-md border border-amber-200 bg-white p-4 text-sm leading-6 text-amber-800">
          AI推薦ではなく、固定ルールによる一般的な食事管理の参考候補を表示しています。候補は指示ではありません。
        </p>

        <section className="rounded-md border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-700">現在の目標: {goalLabel}</p>
        </section>

        <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <h2 className="col-span-full text-sm font-semibold text-slate-900">本日の記録状況（参考入力）</h2>
          <p className="text-sm text-slate-700">食事記録件数: {summary.meal_count}件</p>
          <p className="text-sm text-slate-700">概算カロリー: {summary.estimated_calories_total} kcal</p>
          <p className="text-sm text-slate-700">
            概算PFC: たんぱく質 {summary.estimated_protein_g_total}g / 脂質 {summary.estimated_fat_g_total}g / 炭水化物{" "}
            {summary.estimated_carbs_g_total}g
          </p>
          <p className="text-sm text-slate-700">
            データ整備度: {completeness.label}（任意のPFC入力 {summary.nutrition_estimate_input_count}件）
          </p>
        </section>

        {result.notices.length > 0 ? (
          <ul className="list-disc space-y-1 rounded-md border border-slate-200 bg-amber-50 p-4 text-sm text-amber-800">
            {result.notices.map((notice) => (
              <li key={notice}>{notice}</li>
            ))}
          </ul>
        ) : null}

        <section className="space-y-3">
          <h2 className="text-sm font-semibold text-slate-900">次の食事候補</h2>
          {result.candidates.length === 0 ? (
            <p className="rounded-md border border-dashed border-amber-300 bg-white p-4 text-sm text-amber-700">
              記録の条件が不足しているため、候補を用意できませんでした。情報を足すと候補が出やすくなります。
            </p>
          ) : null}
          {result.candidates.length > 0 ? (
            <ul className="space-y-3">
              {result.candidates.map((candidate) => (
                <li key={candidate.id} className="rounded-md border border-slate-200 bg-white p-4">
                  <p className="text-sm font-semibold text-slate-900">{candidate.title}</p>
                  <p className="mt-1 text-sm text-slate-700">{candidate.summary}</p>
                  <p className="mt-2 text-sm text-slate-600">{candidate.details}</p>
                  <p className="mt-2 text-sm text-slate-600">概算メモ: {candidate.nutritionHint}</p>
                  <p className="mt-2 text-xs text-amber-700">{candidate.safetyNotice}</p>
                  <p className="mt-3 inline-block rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
                    デモでは候補の保存はできません（ログイン後に利用できます）。
                  </p>
                </li>
              ))}
            </ul>
          ) : null}
        </section>

        <section className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="font-semibold text-slate-900">候補の理由</p>
          <ul className="mt-2 space-y-1">
            {result.reasons.map((reason) => (
              <li key={`${reason.code}-${reason.label}`}>
                <span className="font-medium text-slate-900">{reason.label}:</span> {reason.description}
              </li>
            ))}
          </ul>
        </section>

        <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
          固定ルールは「一般的な食事管理の参考候補」を目的にし、具体的な商品名を断定して提示しません。
          極端な制限を促すものではありません。
        </p>

        <p className="text-sm text-amber-700">
          <Link href="/login" className="font-semibold underline underline-offset-2">
            ログイン / 新規登録
          </Link>
          すると、自分の記録に合わせた候補の保存・履歴が使えます。
        </p>
      </div>
    </PageContainer>
  );
}
