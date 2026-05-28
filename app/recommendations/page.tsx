import Link from "next/link";
import { PageContainer } from "../../components/page-container";
import { demoRecommendations } from "../../lib/demo/demo-recommendations";

export default function RecommendationsPage() {
  return (
    <PageContainer
      title="次の食事候補"
      description="候補は参考情報です。極端な制限や断定的な結果を前提としません。"
    >
      <p className="text-sm text-slate-600">日付: {demoRecommendations.date}</p>
      <p className="text-sm text-slate-600">残り目安: {demoRecommendations.remainingCalories} kcal</p>
      <p className="text-sm text-slate-600">方針: {demoRecommendations.focusNutrition}</p>

      <div className="space-y-5">
        {demoRecommendations.sections.map((section) => (
          <section key={section.heading} className="rounded-2xl border border-slate-200 bg-white p-4">
            <h2 className="text-base font-semibold">{section.heading}</h2>
            <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
              {section.items.map((item) => (
                <li key={item.id} className="mb-3">
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p>{item.details}</p>
                  <p className="mt-1">目安: {item.caloriesRange}</p>
                  <p>想定: {item.nutritionHint}</p>
                  <p className="text-xs">{item.safetyNotice}</p>
                  <p className="mt-1 text-xs text-slate-500">カテゴリ: {item.label}</p>
                </li>
              ))}
            </ul>
            <div className="mt-2 text-xs text-slate-600">
              根拠: {section.reasons.map((r) => r.description).join(" / ")}
            </div>
          </section>
        ))}
      </div>

      <Link href="/meals/new" className="inline-block rounded-lg bg-pakufit-600 px-4 py-2 text-sm text-white">
        記録に進む
      </Link>
    </PageContainer>
  );
}
