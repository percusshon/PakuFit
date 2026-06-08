import Link from "next/link";

import { PageContainer } from "@/components/page-container";
import { DemoBanner } from "@/components/demo-banner";

const features: { href: string; title: string; description: string; icon: string }[] = [
  {
    href: "/demo/meals",
    title: "食事記録一覧",
    description: "1日分の食事をサンプルデータで一覧表示します。カロリー/PFCは概算入力値です。",
    icon: "📝",
  },
  {
    href: "/demo/summary",
    title: "今日のサマリー",
    description: "本日分の概算合計と、目標に合わせた読み取りガイドをサンプル表示します。",
    icon: "📊",
  },
  {
    href: "/demo/recommendations",
    title: "次の食事候補",
    description: "固定ルールによる「次の食事候補」をサンプルデータで表示します（AI推薦ではありません）。",
    icon: "🍚",
  },
];

export const metadata = {
  title: "デモ（ログイン不要） / PakuFit",
};

export default function DemoHomePage() {
  return (
    <PageContainer
      title="PakuFit デモ"
      description="ログイン不要で主要画面を確認できる体験用デモです。データは固定のサンプルで、保存・編集はできません。"
    >
      <DemoBanner />

      <div className="grid gap-4 md:grid-cols-3">
        {features.map((feature) => (
          <Link
            key={feature.href}
            href={feature.href}
            className="rounded-lg border border-slate-200 bg-white p-5 transition hover:border-sky-300 hover:bg-sky-50"
          >
            <p className="text-2xl">{feature.icon}</p>
            <p className="mt-2 text-base font-semibold text-slate-900">{feature.title}</p>
            <p className="mt-1 text-sm text-slate-600">{feature.description}</p>
          </Link>
        ))}
      </div>

      <p className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        デモは閲覧専用です。食事の保存・目標設定・写真AI概算などの実機能は、
        <Link href="/login" className="mx-1 font-medium text-amber-900 underline underline-offset-2">
          ログイン / 新規登録
        </Link>
        後にご利用いただけます。
      </p>
    </PageContainer>
  );
}
