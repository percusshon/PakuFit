import { PageContainer } from "../../components/page-container";

export default function PrivacyPage() {
  return (
    <PageContainer title="プライバシー" description="食事写真・目標・履歴は個人に紐づくデータとして取り扱います。">
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">方針</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>写真データと体重情報は本人利用を前提に管理します。</li>
          <li>分析では必要最小限の項目のみを扱い、共有は本人同意なしで行いません。</li>
          <li>運用時はRLS（行レベル）を前提に、保存・参照権限を厳格化します。</li>
        </ul>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">写真からのAI概算について</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>写真AI概算は任意機能です。利用するかどうかはあなたが選べます。</li>
          <li>
            外部AIサービスへの送信には事前の同意（オプトイン）が必要です。同意した場合のみ、概算のときに料理写真が外部AIサービスに送信されます。
          </li>
          <li>同意しない場合は、外部送信は行わずローカルの簡易推定（概算）になります。</li>
          <li>送信した料理写真をアプリ側で保存・再利用することはありません。</li>
          <li>送信先での取り扱いは各AIサービスの規約に従います。</li>
          <li>AI概算は医療・診断を目的とせず、結果は「概算／目安」です。保存前に確認・補正してください。</li>
        </ul>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">本フェーズの扱い</h2>
        <p>
          本リポジトリは設計段階の最小構成です。実接続や収集基準は今後の実装で明確化します。
        </p>
      </section>
    </PageContainer>
  );
}
