import { getRecentMealEntries } from '@/lib/meals/queries'
import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

export default async function RecommendationsPage() {
  const user = await requireAuthUser('/login')
  const meals = await getRecentMealEntries()
  const hasRecords = meals.length > 0

  return (
    <PageContainer title="次の食事候補（準備中）" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-3">
        <p className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          残りカロリー・不足しやすいPFC・時間帯を元に、次の食事候補を作る土台を構築します。
          この画面はあくまで参考情報です。指示ではありません。
        </p>
        {hasRecords ? (
          <p className="rounded-md border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
            今後、記録に基づいてバランスを取りやすい候補を表示します。
          </p>
        ) : (
          <p className="rounded-md border border-dashed border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
            まずは食事記録を追加すると、候補表示の前提が揃います。
          </p>
        )}
      </div>
    </PageContainer>
  )
}
