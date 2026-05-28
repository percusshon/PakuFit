import Link from "next/link";
import { PageContainer } from "../../components/page-container";
import { demoMeals } from "../../lib/demo/demo-meals";
import { StatusBadge } from "../../components/status-badge";

export default function MealsPage() {
  return (
    <PageContainer
      title="食事記録一覧"
      description="食事写真やテキストで保存した記録を確認できます。"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-slate-600">本日は2件の記録を受け付けた想定です（サンプル）。</p>
        <Link href="/meals/new" className="rounded-lg bg-pakufit-600 px-3 py-2 text-sm font-semibold text-white">
          新規登録
        </Link>
      </div>
      <div className="space-y-3">
        {demoMeals.map((meal) => (
          <article key={meal.id} className="rounded-2xl border border-slate-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-slate-900">{meal.date}</h2>
              <StatusBadge label={meal.source === "photo" ? "写真由来" : "テキスト由来"} tone="neutral" />
            </div>
            <p className="mt-2 text-sm text-slate-600">{meal.note}</p>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              {meal.foods.map((food) => (
                <li key={food.id}>
                  {food.name}（{food.quantity}{food.unit}）
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </PageContainer>
  );
}
