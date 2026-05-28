import { PageContainer } from "../../components/page-container";

export default function SafetyPage() {
  return (
    <PageContainer title="安全方針" description="医療・診断・治療目的ではない運用を守るための方針です。">
      <div className="space-y-4">
        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">表示ルール</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>「食事で痩せる」などの断定表現を使いません。</li>
            <li>カロリー/PFCは概算として明示し、ユーザー補正を前提にします。</li>
            <li>極端な削減や断食の誘導を行わず、必要時は相談へ誘導します。</li>
          </ul>
        </section>
        <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <h2 className="text-base font-semibold text-slate-900">利用者配慮</h2>
          <ul className="mt-2 list-disc pl-5">
            <li>未成年、妊娠中、持病・通院中、摂食に不安のある方は画面上で注意文を表示します。</li>
            <li>必要に応じて、医療機関や専門家への相談を促します。</li>
          </ul>
        </section>
      </div>
    </PageContainer>
  );
}
