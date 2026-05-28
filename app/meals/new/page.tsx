import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

export default async function NewMealPage() {
  const user = await requireAuthUser('/login')

  return (
    <PageContainer title="食事入力（準備中）" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-5">
        <div className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          写真アップロード、AI推定、保存処理は次ステップで接続します。
          現在は土台として、本人認証と表示導線を先に確立しています。
        </div>
        <p className="text-sm text-amber-700">食事名・量・食べた割合などは次フェーズで追加します。</p>
      </div>
    </PageContainer>
  )
}
