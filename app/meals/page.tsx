import Link from 'next/link'

import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

export default async function MealsPage() {
  const user = await requireAuthUser('/login')

  return (
    <PageContainer title="今日の食事記録" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <section className="space-y-4">
        <p className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          本画面は本人データ取得の土台です。現在は本人認証状態の確認まで実装し、
          これから本人分の食事履歴とAI推定結果を段階的に接続します。
        </p>
        <div className="flex gap-3">
          <Link href="/meals/new" className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700">
            新規記録
          </Link>
          <Link href="/summary" className="rounded-full border border-amber-200 px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-50">
            1日サマリー
          </Link>
        </div>
      </section>
    </PageContainer>
  )
}
