// Le proxy réécrit en interne chaque adresse publique de la vitrine (/lieux) vers /vitrine/lieux.
// Une ancienne adresse préfixée (/vitrine/lieux) reste servie : on compare toujours l'adresse publique.
export function cheminPublic(chemin: string): string {
  if (chemin === '/vitrine') {
    return '/'
  }
  return chemin.startsWith('/vitrine/') ? chemin.slice('/vitrine'.length) : chemin
}

// « page » : le lien désigne la page affichée ; « true » : le lien désigne la rubrique qui la contient (RGAA 10.10).
export function etatCourant(pathname: string, href: string): EtatCourant {
  const courant = cheminPublic(pathname)
  const cible = cheminPublic(href)
  if (courant === cible) {
    return 'page'
  }
  if (cible !== '/' && courant.startsWith(`${cible}/`)) {
    return 'true'
  }
  return undefined
}

type EtatCourant = 'page' | 'true' | undefined
