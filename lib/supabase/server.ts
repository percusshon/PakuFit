import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { redirect } from 'next/navigation'

import { env } from '@/lib/env'

export const createServerClientSafe = () => {
  const cookieStore = cookies()

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: Array<{ name: string; value: string; options?: CookieOptions }>) => {
          try {
            cookiesToSet.forEach((cookie) => {
              cookieStore.set(cookie.name, cookie.value, cookie.options)
            })
          } catch (error) {
            // Server Components may call before cookie write is allowed.
            // App Router のサーバーコンポーネント側では書き込みが必要ないため、ここでは握りつぶす。
          }
        },
      },
    },
  )
}

export const getServerUser = async () => {
  const supabase = createServerClientSafe()
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    return null
  }

  return data.user
}

export const requireAuthUser = async (redirectTo = '/login') => {
  const user = await getServerUser()
  if (!user) {
    redirect(redirectTo)
  }

  return user
}
