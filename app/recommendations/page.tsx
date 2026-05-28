import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

export default async function RecommendationsPage() {
  const user = await requireAuthUser('/login')

  return (
    <PageContainer title="次の食事候補（準備中）" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <p className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
        残りカロリー・不足しやすいPFC・時間帯を元に、次の食事候補を作る土台を構築します。
        この画面はあくまで参考情報です。指示ではありません。
      </p>
    </PageContainer>
  )
}
