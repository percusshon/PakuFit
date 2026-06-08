import { PageContainer } from "@/components/page-container";
import { DemoBanner } from "@/components/demo-banner";
import { demoMeals } from "@/lib/demo/demo-meals";

const mealTypeLabel: Record<string, string> = {
  breakfast: "朝食",
  lunch: "昼食",
  dinner: "夕食",
  snack: "軽食",
  other: "その他",
};

const formatNutritionValue = (value: number | null) => {
  if (value === null) return "未入力";
  return `${value} g`;
};

export const metadata = {
  title: "デモ: 食事記録一覧 / PakuFit",
};

export default function DemoMealsPage() {
  const meals = demoMeals;

  return (
    <PageContainer title="食事記録一覧（デモ）" description="サンプルデータの表示です。保存・編集はできません。">
      <DemoBanner />

      <section className="space-y-4">
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          食事名・時間帯・概算カロリーを本人データとして保存し、一覧で確認できます。カロリー/PFCは概算の入力値です。
        </div>

        <ul className="space-y-3">
          {meals.map((meal) => (
            <li key={meal.id} className="rounded-md border border-slate-200 bg-white p-4">
              <p className="text-sm font-semibold text-slate-900">
                {mealTypeLabel[meal.meal_type] ?? "その他"}
                <span className="ml-2 text-xs font-normal text-slate-500">
                  {new Date(meal.eaten_at).toLocaleString("ja-JP")}
                </span>
              </p>
              <p className="mt-1 text-slate-900">{meal.title}</p>
              <p className="mt-2 text-sm text-slate-700">
                カロリー（概算）: {meal.estimated_calories !== null ? `${meal.estimated_calories} kcal` : "未入力"}
              </p>

              <p className="mt-2 text-sm font-medium text-slate-900">概算PFC（ユーザー入力値）</p>
              <ul className="mt-1 text-sm text-slate-700">
                <li>たんぱく質: {formatNutritionValue(meal.estimated_protein_g)}</li>
                <li>脂質: {formatNutritionValue(meal.estimated_fat_g)}</li>
                <li>炭水化物: {formatNutritionValue(meal.estimated_carbs_g)}</li>
                <li>食物繊維: {formatNutritionValue(meal.estimated_fiber_g)}</li>
                <li>食塩相当量: {meal.estimated_salt_g === null ? "未入力" : `${meal.estimated_salt_g} g`}</li>
              </ul>

              <p className="mt-2 text-sm text-slate-600">
                メモの有無: {meal.description || meal.portion_note || meal.preparation_note ? "あり" : "なし"}
              </p>
              {meal.portion_note ? <p className="mt-1 text-sm text-slate-600">量メモ: {meal.portion_note}</p> : null}
              {meal.preparation_note ? (
                <p className="mt-1 text-sm text-slate-600">調理/状態メモ: {meal.preparation_note}</p>
              ) : null}
            </li>
          ))}
        </ul>
      </section>
    </PageContainer>
  );
}
