import Link from 'next/link';

import { formatRecommendationCompleteness, calculateMealRecommendations } from '@/lib/recommendations/calculate-meal-recommendations';
import { getTodayMealSummary } from '@/lib/meals/queries';
import { requireAuthUser } from '@/lib/supabase/server';
import { PageContainer } from '@/components/page-container';

export default async function RecommendationsPage() {
  const user = await requireAuthUser('/login');
  const summary = await getTodayMealSummary();
  const result = calculateMealRecommendations({
    mealCount: summary.meal_count,
    estimatedCaloriesTotal: summary.estimated_calories_total,
    estimatedProteinTotal: summary.estimated_protein_g_total,
    estimatedFatTotal: summary.estimated_fat_g_total,
    estimatedCarbsTotal: summary.estimated_carbs_g_total,
    nutritionInputCount: summary.nutrition_estimate_input_count,
    now: new Date(),
  });

  const completeness = formatRecommendationCompleteness(result.dataCompleteness);
  const hasRecords = summary.meal_count > 0;

  return (
    <PageContainer title="次の食事候補" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-3">
        <p className="rounded-md border border-amber-200 bg-white p-4 text-sm leading-6 text-amber-800">
          AI推薦ではなく、固定ルールによる一般的な食事管理の参考候補を表示しています。候補は指示ではありません。
        </p>

        <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 sm:grid-cols-2">
          <h2 className="col-span-full text-sm font-semibold text-slate-900">本日の記録状況（参考入力）</h2>
          <p className="text-sm text-slate-700">食事記録件数: {summary.meal_count}件</p>
          <p className="text-sm text-slate-700">概算カロリー: {summary.estimated_calories_total} kcal</p>
          <p className="text-sm text-slate-700">
            概算PFC: たんぱく質 {summary.estimated_protein_g_total}g / 脂質 {summary.estimated_fat_g_total}g / 炭水化物 {summary.estimated_carbs_g_total}g
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

        {!hasRecords ? (
          <p className="rounded-md border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            まずは食事記録を追加すると、次の候補表示が進みます。
            <Link href="/meals/new" className="ml-2 font-medium text-amber-900 underline underline-offset-2">
              食事を記録する
            </Link>
          </p>
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
                  <p className="text-sm font-semibold text-slate-900">
                    {candidate.title}
                  </p>
                  <p className="mt-1 text-sm text-slate-700">{candidate.summary}</p>
                  <p className="mt-2 text-sm text-slate-600">{candidate.details}</p>
                  <p className="mt-2 text-sm text-slate-600">概算メモ: {candidate.nutritionHint}</p>
                  <p className="mt-2 text-xs text-amber-700">{candidate.safetyNotice}</p>
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
      </div>
    </PageContainer>
  );
}
