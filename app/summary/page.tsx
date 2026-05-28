import { PageContainer } from "../../components/page-container";
import { StatusBadge } from "../../components/status-badge";
import { demoSummary } from "../../lib/demo/demo-meals";

export default function SummaryPage() {
  return (
    <PageContainer
      title="1日のサマリー"
      description="カロリー/PFCは概算で表示し、必要に応じてユーザー確認を前提とします。"
    >
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">総カロリー</p>
          <p className="text-2xl font-bold">{demoSummary.calories} kcal</p>
          <StatusBadge label="概算" tone="neutral" />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">たんぱく質</p>
          <p className="text-2xl font-bold">{demoSummary.proteinG} g</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">脂質</p>
          <p className="text-2xl font-bold">{demoSummary.fatG} g</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <p className="text-sm text-slate-500">炭水化物</p>
          <p className="text-2xl font-bold">{demoSummary.carbG} g</p>
        </div>
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-4">
        <h2 className="font-semibold">残り目安（今日）</h2>
        <ul className="mt-2 list-disc pl-5 text-sm text-slate-700">
          <li>残りカロリー: {demoSummary.remainingCalories} kcal</li>
          <li>残りたんぱく質: {demoSummary.remainingProteinG} g</li>
          <li>残り脂質: {demoSummary.remainingFatG} g</li>
          <li>残り炭水化物: {demoSummary.remainingCarbG} g</li>
        </ul>
      </section>
    </PageContainer>
  );
}
