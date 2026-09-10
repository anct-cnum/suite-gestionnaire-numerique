export function estSiteVitrine(hostname: string): boolean {
  const isVitrineDomain = hostname.startsWith('inclusion-numerique.anct.gouv.fr')

  return isVitrineDomain || process.env.SITE_MODE === 'vitrine'
}
