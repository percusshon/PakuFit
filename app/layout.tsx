import type { Metadata } from "next"
import Link from "next/link"
import "./globals.css"
import AppHeader from "../components/app-header"
import { SafetyNotice } from "../components/safety-notice"

export const metadata: Metadata = {
  title: "パクフィット / PakuFit",
  description:
    "食事記録をサポートするアプリ。写真・テキストから候補を推定し、カロリー/PFCは概算として表示します。"
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>
        <AppHeader />
        <main className="min-h-[calc(100vh-96px)]">{children}</main>
        <footer className="border-t border-white/60 bg-white/80 py-6">
          <div className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8">
            <SafetyNotice />
            <p className="mt-3 text-xs text-slate-500">
              本アプリは個別健康判断・処方の提供を目的としていません。
              一般的な食事管理の参考情報として使う想定です。
              <Link href="/safety" className="ml-1 underline underline-offset-2">
                安全方針を見る
              </Link>
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
