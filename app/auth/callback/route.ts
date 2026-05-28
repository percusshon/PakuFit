import { type NextRequest, NextResponse } from 'next/server'

import { createServerClientSafe } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url))
  }

  const supabase = createServerClientSafe()
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/login?error=auth_callback_failed', request.url))
  }

  return NextResponse.redirect(new URL('/meals', request.url))
}
