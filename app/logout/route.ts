import { NextRequest, NextResponse } from 'next/server'

import { createServerClientSafe } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = createServerClientSafe()
  await supabase.auth.signOut()

  return NextResponse.redirect(new URL('/login', request.url))
}
