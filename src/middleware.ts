import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'

export async function middleware(req: NextRequest) {
  // Buat supabase client dengan req & res
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  // Ambil session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isLoggedIn = !!session?.user
  const pathname = req.nextUrl.pathname

  const protectedRoutes = ['/tasks', '/profile', '/matrix', '/calendertrack']
  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route),
  )

  if (!isLoggedIn && isProtectedRoute) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/login'
    redirectUrl.searchParams.set('redirectedFrom', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const authRoutes = ['/login', '/register']
  if (isLoggedIn && authRoutes.includes(pathname)) {
    const redirectUrl = req.nextUrl.clone()
    redirectUrl.pathname = '/'
    redirectUrl.searchParams.delete('redirectedFrom')
    return NextResponse.redirect(redirectUrl)
  }

  // ⚡ Penting: return res yang sudah diikat dengan supabase client
  return res
}

export const config = {
  matcher: [
    '/',
    '/tasks/:path*',
    '/profile/:path*',
    '/matrix/:path*',
    '/calendertrack/:path*',
    '/login',
    '/register',
  ],
}