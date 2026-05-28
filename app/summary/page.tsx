import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

export default async function SummaryPage() {
  const user = await requireAuthUser('/login')

  return (
    <PageContainer title="1日サマリー（土台）" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-4">
        <p className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          ここでは本人分の食事データ集計を表示するためのページです。
          将来、推定カロリー/PFCの合計を本人向けに表示します。
        </p>
        <p className="text-sm text-amber-700">現在はサンプル文言のみ表示しています。</p>
      </div>
    </PageContainer>
  )
}
