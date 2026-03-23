import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')

  // Use searchParams.next if present, otherwise default to /dashboard
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // In production, we should redirect back to the site URL
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
      const redirectUrl = new URL(next, siteUrl);
      return NextResponse.redirect(redirectUrl.toString())
    }
  }

  // Error case
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || origin;
  return NextResponse.redirect(new URL('/auth/auth-code-error', siteUrl).toString())
}
