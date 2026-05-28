import Link from 'next/link'

import { getRecentMealEntries } from '@/lib/meals/queries'
import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

const mealTypeLabel: Record<string, string> = {
  breakfast: '朝食',
  lunch: '昼食',
  dinner: '夕食',
  snack: '軽食',
  other: 'その他',
}

export default async function MealsPage() {
  const user = await requireAuthUser('/login')
  const meals = await getRecentMealEntries()

  return (
    <PageContainer title="食事記録一覧" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <section className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          食事名・時間帯・概算カロリーを本人データとして保存し、一覧で確認できます。カロリーは概算として扱います。
        </div>

        <div className="flex items-center gap-3">
          <Link href="/meals/new" className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
            新しく記録する
          </Link>
          <Link
            href="/summary"
            className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50"
          >
            今日のサマリーへ
          </Link>
        </div>

        {meals.length === 0 && (
          <div className="rounded-md border border-dashed border-amber-300 bg-white p-4 text-sm text-amber-700">
            記録がまだありません。まずは「新しく記録する」から1件保存してください。
          </div>
        )}

        {meals.length > 0 ? (
          <ul className="space-y-3">
            {meals.map((meal) => (
              <li key={meal.id} className="rounded-md border border-slate-200 bg-white p-4">
                <p className="text-sm font-semibold text-slate-900">
                  {mealTypeLabel[meal.meal_type] ?? 'その他'}
                  <span className="ml-2 text-xs font-normal text-slate-500">
                    {new Date(meal.eaten_at).toLocaleString('ja-JP')}
                  </span>
                </p>
                <p className="mt-1 text-slate-900">{meal.title}</p>
                <p className="mt-2 text-sm text-slate-700">
                  カロリー（概算）: {meal.estimated_calories !== null ? `${meal.estimated_calories} kcal` : '未入力'}
                </p>
                <p className="text-sm text-slate-600">
                  メモの有無: {meal.description || meal.portion_note || meal.preparation_note ? 'あり' : 'なし'}
                </p>
                {meal.portion_note ? <p className="mt-1 text-sm text-slate-600">量メモ: {meal.portion_note}</p> : null}
                {meal.preparation_note ? (
                  <p className="mt-1 text-sm text-slate-600">調理/状態メモ: {meal.preparation_note}</p>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </PageContainer>
  )
}
