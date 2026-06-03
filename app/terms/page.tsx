import Link from "next/link";

import { PageContainer } from "../../components/page-container";

export const metadata = {
  title: "利用規約 | パクフィット",
};

export default function TermsPage() {
  return (
    <PageContainer
      title="利用規約"
      description="本サービスの利用条件です。栄養値・候補は概算・参考情報であり、医療目的ではありません。"
    >
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p>
          本ページは<strong>公開前のドラフト</strong>です。最終的な文言は専門家のレビューを経て確定します。
          事業者名・連絡先・準拠法などは確定後に反映されます。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">第1条（本サービスの内容）</h2>
        <p className="mt-2">
          本サービスは、食事の記録、カロリー/PFC等の概算表示、次の食事候補の提示等を行う、生活管理の参考情報を提供するサービスです。
          提供する栄養値・候補は、いずれも概算・目安・参考情報であり、医療行為・診断・治療・健康効果の保証を目的としません。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">第2条（非医療・自己責任の原則）</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>本サービスは、疾病の診断・治療・予防その他の医療を目的としません。</li>
          <li>健康に関する判断・対応は利用者自身の責任で行い、必要時は医師・管理栄養士等にご相談ください。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">第3条（写真AI概算機能）</h2>
        <p className="mt-2">
          写真からのAI概算は任意機能です。外部AIサービスへの料理写真の送信は、利用者の明示的な同意（オプトイン）があった場合に限り行われます。
          取扱いの詳細は
          <Link href="/privacy" className="ml-1 underline underline-offset-2">
            プライバシーポリシー
          </Link>
          に従います。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">第4条（禁止事項）</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>法令または公序良俗に違反する行為。</li>
          <li>第三者の権利（プライバシー・肖像・知的財産権等）を侵害する行為（写真への第三者の無断写り込みを含む）。</li>
          <li>本サービスの運営妨害、不正アクセス、リバースエンジニアリング等。</li>
          <li>本サービスを医療・診断目的であるかのように利用・喧伝する行為。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">第5条（免責）</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>当社は、提供する情報の正確性・完全性・有用性を保証しません（栄養値は概算です）。</li>
          <li>本サービスの利用により生じた損害について、法令で許容される範囲で責任を負いません。</li>
          <li>サービスの中断・変更・終了により生じた損害について責任を負いません。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">第6条（提携・広告表示）</h2>
        <p className="mt-2">
          将来、提携商品・広告を表示する場合は、提携・広告であることを明示し、参考情報と区別して表示します。
          隠れた優先表示（ステルスマーケティング）は行いません。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">第7条（規約の変更・準拠法）</h2>
        <p className="mt-2">
          当社は必要に応じて本規約を変更でき、重要な変更は本サービス上で周知します。
          準拠法・裁判管轄は確定後に明記します（公開前ドラフト）。
        </p>
      </section>
    </PageContainer>
  );
}
