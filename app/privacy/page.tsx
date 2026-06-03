import Link from "next/link";

import { PageContainer } from "../../components/page-container";

export const metadata = {
  title: "プライバシーポリシー | パクフィット",
};

export default function PrivacyPage() {
  return (
    <PageContainer
      title="プライバシーポリシー"
      description="食事写真・目標・履歴は個人に紐づくデータとして取り扱います。"
    >
      <section className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
        <p>
          本ページは<strong>公開前のドラフト</strong>です。最終的な文言は専門家のレビューを経て確定します。
          事業者名・連絡先・保管先などは確定後に反映されます。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">1. 取得する情報</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>アカウント情報（メールアドレス／メールリンク認証）。</li>
          <li>プロフィール（表示名等・任意）。</li>
          <li>食事記録（食事内容・摂取日時・食事写真・メモ）。</li>
          <li>健康目標（目標カテゴリ・目標カロリー/PFC・メモ）。</li>
          <li>概算・推定情報（カロリー/PFCの概算値・信頼度・補正値・提案履歴）。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">2. 利用目的</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>本サービスの提供・本人認証・記録の保存と表示。</li>
          <li>カロリー/PFCの概算表示および食事候補の提示。</li>
          <li>概算精度の検証・改善（個人を特定しない統計的な集計を含む）。</li>
          <li>不正利用の防止、問い合わせ対応、サービスの維持・改善。</li>
        </ul>
        <p className="mt-2">栄養に関する数値はすべて概算・目安であり、医療上の診断・治療・効果を保証しません。</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">3. 写真からのAI概算（外部送信）</h2>
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
        <h2 className="text-base font-semibold text-slate-900">4. 第三者提供・委託・外国にある第三者への提供</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>法令に基づく場合等を除き、本人の同意なく個人情報を第三者に提供しません。</li>
          <li>サービス運営のため、データの保管・処理を外部事業者に委託します（ホスティング・データベース・画像保管）。</li>
          <li>委託先や外部AIサービスが外国に所在する場合の取扱いは、確定後に明記します（公開前ドラフト）。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">5. 安全管理措置</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>行レベルセキュリティ（RLS）により、原則として本人のみがアクセスできるよう制御します。</li>
          <li>アプリは限定的な権限のみを用い、管理用の特権キーをクライアントで使用しません。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">6. 開示・訂正・利用停止等／お問い合わせ</h2>
        <p className="mt-2">
          自己の個人データについて、開示・訂正・利用停止・削除等を請求できます。アカウント削除に伴い関連データは原則削除されます。
          受付窓口・保持期間は確定後に明記します（公開前ドラフト）。
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">7. 利用者へのお願い・未成年の利用</h2>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>食事写真に第三者の容ぼう・個人を特定し得る情報が含まれないようご配慮ください。</li>
          <li>健康状態に不安がある場合は、数値に依拠せず専門家にご相談ください。</li>
          <li>未成年の利用方針は確定後に明記します（公開前ドラフト）。</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700">
        <h2 className="text-base font-semibold text-slate-900">8. Cookie・外部送信について</h2>
        <p className="mt-2">
          現時点で広告・解析目的の第三者Cookieや外部送信タグは使用していません。将来導入する場合は、適用法令に従い必要な通知・公表を行います。
        </p>
        <p className="mt-3">
          あわせて
          <Link href="/terms" className="mx-1 underline underline-offset-2">
            利用規約
          </Link>
          をご確認ください。
        </p>
      </section>
    </PageContainer>
  );
}
