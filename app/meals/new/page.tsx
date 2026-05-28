import { createMealEntry } from '@/lib/meals/actions'
import { requireAuthUser } from '@/lib/supabase/server'
import { PageContainer } from '@/components/page-container'

const toDateTimeLocalValue = () => {
  const now = new Date()
  const offsetMinute = now.getTimezoneOffset()
  const local = new Date(now.getTime() - offsetMinute * 60 * 1000)
  return local.toISOString().slice(0, 16)
}

export default async function NewMealPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const user = await requireAuthUser('/login')

  const error = searchParams.error

  return (
    <PageContainer title="食事を記録する" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-5">
        <p className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          写真アップロード、AI推定、バーコード連携は今後追加予定です。今は
          「食事名」と「概算カロリー」を中心に記録し、後続の候補表示で活用します。
        </p>

        {error === 'empty_title' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食事名は必須です。</div>
        )}
        {error === 'invalid_meal_type' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食事区分が不正です。</div>
        )}
        {error === 'invalid_eaten_at' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食べた日時が不正です。</div>
        )}
        {error === 'invalid_calories' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">カロリーは0〜5000の範囲で入力してください。</div>
        )}
        {error === 'save_failed' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
            保存に失敗しました。接続状況を確認して再度お試しください。
          </div>
        )}

        <form action={createMealEntry} className="space-y-4 rounded-lg border border-amber-200 bg-white p-5">
          <label className="block text-sm font-medium text-amber-900" htmlFor="meal_type">
            食事区分
            <select
              id="meal_type"
              name="meal_type"
              defaultValue="other"
              required
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            >
              <option value="breakfast">朝食</option>
              <option value="lunch">昼食</option>
              <option value="dinner">夕食</option>
              <option value="snack">軽食</option>
              <option value="other">その他</option>
            </select>
          </label>

          <label className="block text-sm font-medium text-amber-900" htmlFor="eaten_at">
            食べた日時
            <input
              id="eaten_at"
              name="eaten_at"
              type="datetime-local"
              defaultValue={toDateTimeLocalValue()}
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-amber-900" htmlFor="title">
            食事名
            <input
              id="title"
              name="title"
              type="text"
              required
              placeholder="例: ご飯と味噌汁"
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-amber-900" htmlFor="description">
            メモ
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="例: 味噌汁は薄味"
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-amber-900" htmlFor="estimated_calories">
            概算カロリー（kcal）
            <input
              id="estimated_calories"
              name="estimated_calories"
              type="number"
              min={0}
              max={5000}
              placeholder="未確定の場合は空欄"
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            />
            <p className="mt-1 text-xs text-slate-600">カロリーは概算です。最終値はユーザー確認が必要です。</p>
          </label>

          <label className="block text-sm font-medium text-amber-900" htmlFor="portion_note">
            食べた量メモ
            <input
              id="portion_note"
              name="portion_note"
              type="text"
              placeholder="例: 半分"
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            />
          </label>

          <label className="block text-sm font-medium text-amber-900" htmlFor="preparation_note">
            調理/状態メモ
            <input
              id="preparation_note"
              name="preparation_note"
              type="text"
              placeholder="例: お弁当（冷めていた）"
              className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
            />
          </label>

          <div className="rounded border border-dashed border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
            写真アップロード機能は現在未実装です。画像入力とAI推定は次ステップで追加予定です。
          </div>

          <button
            type="submit"
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            記録を保存
          </button>
        </form>
      </div>
    </PageContainer>
  )
}
