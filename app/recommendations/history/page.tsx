import Link from 'next/link';

import { getSavedMealRecommendations } from '@/lib/recommendations/queries';
import { getCurrentUserGoal } from '@/lib/goals/queries';
import { requireAuthUser } from '@/lib/supabase/server';
import { PageContainer } from '@/components/page-container';
import { formatRecommendationCompleteness } from '@/lib/recommendations/calculate-meal-recommendations';

const goalLabelMap: Record<string, string> = {
  weight_management: '体重管理',
  balanced_meals: '食事バランス改善',
  higher_protein: 'たんぱく質を意識',
  lower_fat: '脂質を控えめにしたい',
  convenience_store_friendly: '外食/コンビニ中心でも整える',
};

export default async function RecommendationHistoryPage() {
  const user = await requireAuthUser('/login');
  const recommendations = await getSavedMealRecommendations();
  const goal = await getCurrentUserGoal();

  return (
    <PageContainer title="保存された候補履歴" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-4">
        <p className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          候補は固定ルールによる参考情報として保存されます。保存履歴は本人データのみ表示します。
        </p>

        <section className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p>
            現在の目標: {goal?.goalType ? goalLabelMap[goal.goalType] : '未設定'}
          </p>
          <p className="mt-1">
            <Link href="/recommendations" className="font-medium text-amber-900 underline underline-offset-2">
              候補に戻る
            </Link>
          </p>
        </section>

        <section className="space-y-3">
          {recommendations.length === 0 ? (
            <div className="rounded-md border border-dashed border-amber-300 bg-white p-4 text-sm text-amber-800">
              保存済みの候補はまだありません。
              <p className="mt-2">
                <Link href="/recommendations" className="font-medium text-amber-900 underline underline-offset-2">
                  候補表示へ進む
                </Link>
              </p>
            </div>
          ) : (
            <ul className="space-y-3">
              {recommendations.map((item) => {
                const completeness = formatRecommendationCompleteness(item.data_completeness);
                return (
                  <li key={item.id} className="rounded-md border border-slate-200 bg-white p-4">
                    <p className="text-sm text-slate-700">保存日時: {new Date(item.generated_at).toLocaleString('ja-JP')}</p>
                    <p className="mt-2 text-sm font-semibold text-slate-900">{item.candidate_title}</p>
                    <p className="mt-1 text-sm text-slate-700">{item.candidate_description}</p>
                    <div className="mt-2 text-sm text-slate-700">
                      <p>目標タイプ: {item.goal_category ? goalLabelMap[item.goal_category] ?? item.goal_category : '未設定'}</p>
                      <p>データ充足度: {completeness.label}</p>
                      <p>source: {item.source}</p>
                      {item.reason_label ? <p>理由: {item.reason_label}</p> : null}
                      {item.caution_text ? <p>注意文: {item.caution_text}</p> : null}
                      {item.reason_code ? <p>理由コード: {item.reason_code}</p> : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </PageContainer>
  );
}
