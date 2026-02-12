import { createServerClient } from "@supabase/ssr"
import { NextResponse, NextRequest } from "next/server"
import { isProfileComplete } from "./action/auth"

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)
  const requestWithPath = new NextRequest(request.url, { headers: requestHeaders })

  let supabaseResponse = NextResponse.next({
    request: requestWithPath,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return requestWithPath.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => requestWithPath.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request: requestWithPath,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define public routes that don't require authentication

  const publicRoutes = ['/login', '/signup', '/auth/callback', '/auth', '/forget-password', '/auth/reset-password', '/', '/communities', '/verify-email']
  const isPublicRoute = publicRoutes.includes(pathname) || pathname.startsWith('/communities/') || pathname.startsWith('/invite/') || pathname.startsWith('/auth/')
  
  // OAuth callback route needs special handling - always allow it through
  const isCallbackRoute = pathname.startsWith('/auth/callback')

  // If user is not authenticated and trying to access a protected route
  if (!user && !isPublicRoute) {
    const redirectUrl = new URL('/login', request.url)
    // Add the current path as a query parameter to redirect back after login
    redirectUrl.searchParams.set('next', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to home
  // BUT allow the callback route, /login (to avoid redirect loop after logout), /invite (handled by invite page), and /onboarding
  const isAuthPage = isPublicRoute && !isCallbackRoute && pathname !== "/login" && pathname !== "/onboarding" && !pathname.startsWith("/invite/")
  if (user && isAuthPage) {
    const isUserProfileComplete = await isProfileComplete(user.id)
    // Don't redirect from / to onboarding - avoids loop when middleware sees stale data after profile completion
    if (isUserProfileComplete.data?.needsOnboarding && pathname !== "/") {
      return NextResponse.redirect(new URL('/onboarding', request.url))
    } else if (pathname !== "/" && pathname !== "/communities" && !pathname.startsWith("/communities/")) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - invite/ (handled by invite page - must load without auth check)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|invite/|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
