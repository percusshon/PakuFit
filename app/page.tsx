import Link from "next/link";
import { FeatureCard } from "../components/feature-card";
import { PageContainer } from "../components/page-container";

export default function HomePage() {
  return (
    <PageContainer
      title="パクフィット / PakuFit"
      description="食事記録をサポートするための初期MVPです。写真・テキスト入力を使ってカロリー/PFCを概算し、次の食事候補を出すことを目指しています。"
    >
      <div className="grid gap-4 md:grid-cols-2">
        <FeatureCard
          title="食事記録"
          description="食事写真アップロードまたはテキスト入力で1日分をまとめて管理できます。"
          icon="📝"
        >
          <Link href="/meals/new" className="text-sm font-semibold text-pakufit-700 underline underline-offset-2">
            記録を開始
          </Link>
        </FeatureCard>
        <FeatureCard
          title="概算の栄養表示"
          description="AI推定値は目安です。料理名・量・食べた割合はユーザー確認が必要です。"
          icon="📊"
        />
        <FeatureCard
          title="次の食事候補"
          description="残りカロリーと不足しやすいPFCをもとに、バランスを取りやすい候補を提示します。"
          icon="🍚"
        >
          <Link href="/recommendations" className="text-sm font-semibold text-pakufit-700 underline underline-offset-2">
            候補を確認
          </Link>
        </FeatureCard>
        <FeatureCard
          title="開発中ステータス"
          description="Phase1: Next.js + Supabase雛形の土台を用意しています。"
          icon="🛠️"
        >
          <Link href="/privacy" className="text-sm font-semibold text-slate-700 underline underline-offset-2">
            主要ページ一覧
          </Link>
        </FeatureCard>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
        <Link
          href="/meals"
          className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
        >
          食事一覧
        </Link>
        <Link
          href="/summary"
          className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
        >
          今日のサマリー
        </Link>
        <Link
          href="/settings/goals"
          className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
        >
          目標設定
        </Link>
        <Link
          href="/login"
          className="rounded-lg border border-slate-200 bg-white p-3 text-sm text-slate-700 hover:bg-slate-50"
        >
          ログイン（仮）
        </Link>
      </div>
    </PageContainer>
  );
}
