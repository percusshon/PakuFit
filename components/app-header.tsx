import Link from 'next/link'

import { getServerUser } from '@/lib/supabase/server'

export default async function AppHeader() {
  const user = await getServerUser()

  return (
    <header className="border-b border-amber-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
        <div>
          <h1 className="text-lg font-semibold text-amber-900">パクフィット / PakuFit</h1>
          <p className="text-xs text-amber-700">食事記録をサポートするダッシュボード</p>
        </div>

        <nav className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-amber-800 hover:text-amber-900">
            ホーム
          </Link>
          <Link href="/demo" className="text-sky-700 hover:text-sky-900">
            デモ
          </Link>
          {user ? (
            <>
              <span className="text-amber-700">ログイン中: {user.email ?? 'ユーザー'}</span>
              <Link href="/meals" className="text-amber-800 hover:text-amber-900">
                記録
              </Link>
              <Link href="/recommendations" className="text-amber-800 hover:text-amber-900">
                次の候補
              </Link>
              <Link href="/recommendations/history" className="text-amber-800 hover:text-amber-900">
                履歴
              </Link>
              <Link href="/settings/goals" className="text-amber-800 hover:text-amber-900">
                目標
              </Link>
              <Link href="/logout" className="font-semibold text-amber-700 underline-offset-4 hover:underline">
                ログアウト
              </Link>
            </>
          ) : (
            <Link href="/login" className="font-semibold text-amber-700 underline-offset-4 hover:underline">
              ログイン
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
