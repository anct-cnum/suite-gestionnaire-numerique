import { NextRequest, NextResponse } from 'next/server'
import { getSession } from 'next-auth/react'

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const session = await getSession()
  const isDeconnexionPage = request.nextUrl.pathname === '/deconnexion'

  if (session && !isDeconnexionPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
} 