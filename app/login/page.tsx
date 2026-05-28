import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createServerClientSafe } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { PageContainer } from '@/components/page-container'
import { SafetyNotice } from '@/components/safety-notice'

async function sendMagicLink(formData: FormData) {
  'use server'

  const rawEmail = formData.get('email')
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : ''

  if (!email || !email.includes('@')) {
    redirect('/login?error=invalid_email')
  }

  const supabase = createServerClientSafe()
  const redirectTo = `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: redirectTo,
    },
  })

  if (error) {
    redirect('/login?error=send_failed')
  }

  redirect('/login?sent=1')
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { sent?: string; error?: string }
}) {
  const sent = searchParams?.sent === '1'
  const error = searchParams?.error

  return (
    <PageContainer
      title="ログイン"
      description="メールアドレスでMagic Linkを送ってログインします。パスワードは不要です。"
    >
      <div className="mx-auto max-w-xl space-y-6">
        <p className="text-sm leading-relaxed text-amber-800">PakuFit はメール1本でログインできます。</p>

        {sent && (
          <div className="rounded-lg bg-emerald-50 p-4 text-sm text-emerald-800">
            確認メールを送信しました。受信ボックス内のリンクからログインしてください。
          </div>
        )}

        {error === 'invalid_email' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">有効なメールアドレスを入力してください。</div>
        )}

        {error === 'send_failed' && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">メール送信できませんでした。環境設定を確認してください。</div>
        )}

        <form action={sendMagicLink} className="space-y-3 rounded-lg border border-amber-200 bg-white p-5">
          <label className="block text-sm font-medium text-amber-900" htmlFor="email">
            メールアドレス
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="name@example.com"
            className="w-full rounded-md border border-amber-200 px-3 py-2"
          />
          <button
            type="submit"
            className="rounded-full bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            確認メールを送る
          </button>
        </form>

        <p className="text-sm text-amber-700">
          ログイン後はカロリー/PFCを概算として表示し、
          <span className="font-medium"> 次の食事候補</span>を参考として確認できます。
        </p>
        <SafetyNotice className="text-sm" />
        <p className="text-sm text-amber-700">
          <Link href="/" className="text-amber-700 underline underline-offset-4">
            ホームへ戻る
          </Link>
        </p>
      </div>
    </PageContainer>
  )
}
