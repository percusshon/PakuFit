import { redirect } from 'next/navigation'

import { createServerClientSafe } from '@/lib/supabase/server'
import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

async function saveGoal(formData: FormData) {
  'use server'

  const user = await requireAuthUser('/login')
  const category = String(formData.get('goal_category') || 'weight_management')
  const targetCalories = Number(formData.get('target_calories_per_day') || '') || null
  const targetProtein = Number(formData.get('target_protein_g') || '') || null
  const targetFat = Number(formData.get('target_fat_g') || '') || null
  const targetCarbs = Number(formData.get('target_carbs_g') || '') || null
  const notes = String(formData.get('notes') || '').slice(0, 400)

  const supabase = createServerClientSafe()

  const { error } = await supabase.from('user_goals').upsert(
    {
      user_id: user.id,
      goal_category: category,
      target_calories_per_day: targetCalories || null,
      target_protein_g: targetProtein || null,
      target_fat_g: targetFat || null,
      target_carbs_g: targetCarbs || null,
      notes,
    },
    {
      onConflict: 'user_id,goal_category',
      ignoreDuplicates: false,
    },
  )

  if (error) {
    redirect('/settings/goals?error=save_failed')
  }

  redirect('/settings/goals?saved=1')
}

export default async function GoalsPage({
  searchParams,
}: {
  searchParams: { saved?: string; error?: string }
}) {
  const user = await requireAuthUser('/login')
  const supabase = createServerClientSafe()
  const { data: goals } = await supabase.from('user_goals').select('*').eq('user_id', user.id)

  return (
    <PageContainer title="目標設定" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-6">
        {searchParams.saved === '1' && (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">保存しました。</div>
        )}
        {searchParams.error === 'save_failed' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">保存に失敗しました。後で再試行してください。</div>
        )}

        <form action={saveGoal} className="space-y-3 rounded-lg border border-amber-200 bg-white p-5">
          <label className="block text-sm font-medium text-amber-900" htmlFor="goal_category">
            目標カテゴリ
          </label>
          <select
            id="goal_category"
            name="goal_category"
            className="w-full rounded-md border border-amber-200 px-3 py-2"
            defaultValue="weight_management"
          >
            <option value="weight_management">体重管理</option>
            <option value="balance_improvement">食事バランス改善</option>
            <option value="protein_focus">たんぱく質を意識</option>
            <option value="fat_moderation">脂質を控えめ</option>
            <option value="convenience_balance">外食/コンビニでも整える</option>
          </select>

          <div className="grid gap-2 sm:grid-cols-3">
            <label className="text-sm text-amber-900">
              目標摂取カロリー（1日）
              <input
                name="target_calories_per_day"
                type="number"
                min="0"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-amber-900">
              タンパク質（g）
              <input
                name="target_protein_g"
                type="number"
                min="0"
                step="0.1"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-amber-900">
              脂質（g）
              <input
                name="target_fat_g"
                type="number"
                min="0"
                step="0.1"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
            </label>
            <label className="text-sm text-amber-900">
              炭水化物（g）
              <input
                name="target_carbs_g"
                type="number"
                min="0"
                step="0.1"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
            </label>
          </div>

          <label className="block text-sm font-medium text-amber-900">
            メモ
            <textarea
              name="notes"
              rows={4}
              placeholder="例: 外食中心の日は脂質をやや控えめにする等"
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            />
          </label>

          <button
            type="submit"
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            目標を保存
          </button>
        </form>

        <section className="rounded-lg border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-sm font-semibold text-amber-900">保存済みの目標（参考）</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-800">
            {goals?.map((goal) => (
              <li key={goal.id} className="rounded bg-white p-2">
                {goal.goal_category}: kcal {goal.target_calories_per_day ?? '-'} / P:{goal.target_protein_g ?? '-'} g / F:{goal.target_fat_g ?? '-'} g / C:{goal.target_carbs_g ?? '-'} g
              </li>
            ))}
            {!goals?.length && <li className="text-amber-700">まだ目標は未登録です。</li>}
          </ul>
        </section>
      </div>
    </PageContainer>
  )
}
