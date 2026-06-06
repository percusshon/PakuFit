import Link from 'next/link'
import { redirect } from 'next/navigation'

import { createServerClientSafe } from '@/lib/supabase/server'
import { env } from '@/lib/env'
import { PageContainer } from '@/components/page-container'
import { SafetyNotice } from '@/components/safety-notice'

function parseCreds(formData: FormData) {
  const rawEmail = formData.get('email')
  const rawPassword = formData.get('password')
  const email = typeof rawEmail === 'string' ? rawEmail.trim() : ''
  const password = typeof rawPassword === 'string' ? rawPassword : ''
  return { email, password }
}

async function signInAction(formData: FormData) {
  'use server'

  const { email, password } = parseCreds(formData)
  if (!email.includes('@') || password.length < 6) {
    redirect('/login?error=invalid_input')
  }

  const supabase = createServerClientSafe()
  const { error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    redirect('/login?error=signin_failed')
  }

  redirect('/meals')
}

async function signUpAction(formData: FormData) {
  'use server'

  const { email, password } = parseCreds(formData)
  if (!email.includes('@') || password.length < 6) {
    redirect('/login?error=invalid_input')
  }

  const supabase = createServerClientSafe()
  const { error } = await supabase.auth.signUp({ email, password })

  if (error) {
    redirect('/login?error=signup_failed')
  }

  redirect('/meals')
}

async function googleAction() {
  'use server'

  const supabase = createServerClientSafe()
  const redirectTo = `${env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback`
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo },
  })

  if (error || !data?.url) {
    redirect('/login?error=google_unavailable')
  }

  redirect(data.url)
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string }
}) {
  const error = searchParams?.error

  const errorMessages: Record<string, string> = {
    invalid_input: 'メールアドレスの形式と、6文字以上のパスワードを確認してください。',
    signin_failed: 'メールアドレスまたはパスワードが違います（未登録の場合は「新規登録」を押してください）。',
    signup_failed: 'このメールアドレスは登録済みの可能性があります。「ログイン」を試してください。',
    google_unavailable: 'Googleログインは現在準備中です。メールとパスワードでお試しください。',
  }

  return (
    <PageContainer
      title="ログイン / 新規登録"
      description="メールアドレスとパスワードで利用できます。確認メールは不要で、すぐに始められます。"
    >
      <div className="mx-auto max-w-xl space-y-6">
        {error && errorMessages[error] && (
          <div className="rounded-lg bg-rose-50 p-4 text-sm text-rose-700">{errorMessages[error]}</div>
        )}

        <form className="space-y-3 rounded-lg border border-amber-200 bg-white p-5">
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

          <label className="block text-sm font-medium text-amber-900" htmlFor="password">
            パスワード（6文字以上）
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="パスワード"
            className="w-full rounded-md border border-amber-200 px-3 py-2"
          />

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="submit"
              formAction={signInAction}
              className="rounded-full bg-amber-600 px-5 py-2 text-sm font-semibold text-white hover:bg-amber-700"
            >
              ログイン
            </button>
            <button
              type="submit"
              formAction={signUpAction}
              className="rounded-full border border-amber-600 px-5 py-2 text-sm font-semibold text-amber-700 hover:bg-amber-50"
            >
              新規登録
            </button>
          </div>
          <p className="text-xs text-amber-700">はじめての方は「新規登録」を押すとすぐ使えます。</p>
        </form>

        <div className="flex items-center gap-3 text-xs text-amber-600">
          <span className="h-px flex-1 bg-amber-200" />
          または
          <span className="h-px flex-1 bg-amber-200" />
        </div>

        <form action={googleAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full border border-slate-300 bg-white px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Google でログイン
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
