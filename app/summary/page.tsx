import { getRecentMealEntries, getTodayMealSummary } from '@/lib/meals/queries';
import { requireAuthUser } from '@/lib/supabase/server';
import { PageContainer } from '@/components/page-container';
import Link from 'next/link';

export default async function SummaryPage() {
  const user = await requireAuthUser('/login');
  const [summary, recentMeals] = await Promise.all([getTodayMealSummary(), getRecentMealEntries()]);
  const latestMeals = recentMeals.slice(0, 5);

  return (
    <PageContainer title="今日のサマリー" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          本日（{summary.date}）の記録を本人データとして集計します。表示値は概算で、任意入力値ベースです。
        </div>
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
          {latestMeals.length === 0 ? (
            <p className="mt-2 text-sm text-slate-700">まだ本日の記録がありません。</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {latestMeals.map((meal) => (
                <li key={meal.id} className="rounded border border-slate-100 bg-amber-50 p-2">
                  {new Date(meal.eaten_at).toLocaleString('ja-JP')} / {meal.title} /{' '}
                  {meal.estimated_calories === null ? 'カロリー未入力' : `${meal.estimated_calories} kcal`}
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-semibold text-amber-900">次の食事候補との接続</p>
          <p className="mt-1">
            PFC任意入力があると、候補の参考情報が出しやすくなります。まずは
            <Link href="/recommendations" className="mx-1 font-semibold text-amber-900 underline underline-offset-2">
              次の食事候補
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
