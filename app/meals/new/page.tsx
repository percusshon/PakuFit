import { createMealEntry } from '@/lib/meals/actions';
import { requireAuthUser } from '@/lib/supabase/server';
import { PageContainer } from '@/components/page-container';
import { MealPhotoEstimator } from '@/components/meal-photo-estimator';
import { BarcodeScanner } from '@/components/barcode-scanner';

const toDateTimeLocalValue = () => {
  const now = new Date();
  const offsetMinute = now.getTimezoneOffset();
  const local = new Date(now.getTime() - offsetMinute * 60 * 1000);
  return local.toISOString().slice(0, 16);
};

const numberInputHint = '数値は0以上で入力してください。未入力は空欄でOKです。';

export default async function NewMealPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await requireAuthUser('/login');

  const error = searchParams.error;

  return (
    <PageContainer title="食事を記録する" description={`ログイン中: ${user.email ?? 'ユーザー'}`}>
      <div className="space-y-5">
        <p className="rounded-md border border-amber-200 bg-white p-4 text-sm text-amber-800">
          写真からのAI概算に対応しました（任意）。写真を選んで概算を取り込み、必要に応じて補正して保存できます。
          対応端末ではバーコードからJANコードを読み取れます（商品データベース照合は今後対応予定）。
        </p>

        {error === 'empty_title' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食事名は必須です。</div>
        )}
        {error === 'invalid_meal_type' && <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食事区分が不正です。</div>}
        {error === 'invalid_eaten_at' && <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食べた日時が不正です。</div>}
        {error === 'invalid_calories' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">カロリーは0〜5000の範囲で入力してください。</div>
        )}
        {error === 'invalid_protein' && <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">たんぱく質は0〜500gで入力してください。</div>}
        {error === 'invalid_fat' && <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">脂質は0〜500gで入力してください。</div>}
        {error === 'invalid_carbs' && <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">炭水化物は0〜500gで入力してください。</div>}
        {error === 'invalid_fiber' && <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食物繊維は0〜100gで入力してください。</div>}
        {error === 'invalid_salt' && <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">食塩相当量は0〜50gで入力してください。</div>}
        {error === 'save_failed' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">
            保存に失敗しました。接続状況を確認して再度お試しください。
          </div>
        )}

        <form action={createMealEntry} className="space-y-4 rounded-lg border border-amber-200 bg-white p-5">
          <input type="hidden" id="estimate_method" name="estimate_method" defaultValue="manual" />

          <MealPhotoEstimator />

          <BarcodeScanner />

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

          <fieldset className="space-y-3 rounded-md border border-slate-200 bg-amber-50 p-3">
            <legend className="mx-auto px-2 text-sm font-semibold text-slate-900">概算（任意）</legend>

            <label className="block text-sm font-medium text-amber-900" htmlFor="estimated_calories">
              カロリー（kcal）
              <input
                id="estimated_calories"
                name="estimated_calories"
                type="number"
                min={0}
                max={5000}
                step="1"
                placeholder="未確定の場合は空欄"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-600">概算です。ユーザー確認が必要です。</p>
            </label>

            <label className="block text-sm font-medium text-amber-900" htmlFor="estimated_protein_g">
              たんぱく質（g）
              <input
                id="estimated_protein_g"
                name="estimated_protein_g"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="任意"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-600">{numberInputHint}</p>
            </label>

            <label className="block text-sm font-medium text-amber-900" htmlFor="estimated_fat_g">
              脂質（g）
              <input
                id="estimated_fat_g"
                name="estimated_fat_g"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="任意"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-600">{numberInputHint}</p>
            </label>

            <label className="block text-sm font-medium text-amber-900" htmlFor="estimated_carbs_g">
              炭水化物（g）
              <input
                id="estimated_carbs_g"
                name="estimated_carbs_g"
                type="number"
                min={0}
                max={500}
                step="0.1"
                placeholder="任意"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-600">{numberInputHint}</p>
            </label>

            <label className="block text-sm font-medium text-amber-900" htmlFor="estimated_fiber_g">
              食物繊維（g）
              <input
                id="estimated_fiber_g"
                name="estimated_fiber_g"
                type="number"
                min={0}
                max={100}
                step="0.1"
                placeholder="任意"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-600">{numberInputHint}</p>
            </label>

            <label className="block text-sm font-medium text-amber-900" htmlFor="estimated_salt_g">
              食塩相当量（g）
              <input
                id="estimated_salt_g"
                name="estimated_salt_g"
                type="number"
                min={0}
                max={50}
                step="0.1"
                placeholder="任意"
                className="mt-1 w-full rounded-md border border-amber-200 px-3 py-2"
              />
              <p className="mt-1 text-xs text-slate-600">{numberInputHint}</p>
            </label>
          </fieldset>

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

          <button
            type="submit"
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            記録を保存
          </button>
        </form>
      </div>
    </PageContainer>
  );
}
