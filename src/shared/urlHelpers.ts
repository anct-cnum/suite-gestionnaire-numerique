
export function gestionMembresGouvernanceUrl(uidGouvernance: string): string {
  return `/gouvernance/${uidGouvernance}/membres`
}

//retourne l'url de la feuille de route par son uid et l'id de la gouvernance
export function feuilleDeRouteUrl(uidGouvernance: string, uidFeuilleDeRoute: string): string {
  return `/gouvernance/${uidGouvernance}/feuilles-de-route/${uidFeuilleDeRoute}`
}

