import { NextRequest, NextResponse } from 'next/server'

export function middleware(request: NextRequest): NextResponse {
  const hostname = request.headers.get('host') ?? ''

  // Déterminer si on est sur le site vitrine
  // En production: inclusion-numerique.anct.gouv.fr (sans préfixe min.)
  // En développement: utiliser SITE_MODE=vitrine pour forcer le mode vitrine
  const isVitrineDomain = hostname.startsWith('inclusion-numerique.anct.gouv.fr') &&
                          !hostname.startsWith('min.inclusion-numerique.anct.gouv.fr')
  const isVitrineMode = process.env.SITE_MODE === 'vitrine'

  const isVitrine = isVitrineDomain || isVitrineMode

  // Si on est sur le site vitrine, rewrite vers les routes /vitrine
  if (isVitrine) {
    const url = request.nextUrl.clone()

    // Éviter les rewrites infinis en vérifiant qu'on n'est pas déjà sur /vitrine
    if (!url.pathname.startsWith('/vitrine') && !url.pathname.startsWith('/_next') && !url.pathname.startsWith('/api')) {
      url.pathname = `/vitrine${url.pathname}`
      return NextResponse.rewrite(url)
    }
  } else if (request.nextUrl.pathname.startsWith('/vitrine')) {
    // Bloquer l'accès direct à /vitrine si on n'est pas en mode vitrine
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

// Configuration pour spécifier sur quelles routes le middleware s'applique
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}
