import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
import { createSupabaseServerClient } from '@/utils/supabase-server'
import { handleOAuthCallback } from '@/action/auth';

export async function GET(request: Request) {

  console.log('Callback route hit');

  const { searchParams, origin } = new URL(request.url)
  const provider = searchParams.get('provider')
  const code = searchParams.get('code')

  const type = searchParams.get('type')

  console.log('Type', type);

  // if "next" is in param, use it as the redirect URL
  let next = searchParams.get('next') ?? '/'
  if (!next.startsWith('/')) {
    // if "next" is not a relative URL, use the default
    next = '/'
  }
  const supabase = await createSupabaseServerClient()
  if (!code) {
    console.log('No code found')
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }

  if (type && type === 'recovery') {
    return NextResponse.redirect(`${origin}/auth/reset-password?code=${code}`)
  }


  const { error: exchangeCodeError } = await supabase.auth.exchangeCodeForSession(code)

  if (exchangeCodeError) {
    console.log('Exchange code error', exchangeCodeError)
    return NextResponse.redirect(`${origin}/auth/auth-code-error`)
  }


  if (provider) {
    await handleOAuthCallback(provider)
  }

  return NextResponse.redirect(`${origin}${next}`)
}