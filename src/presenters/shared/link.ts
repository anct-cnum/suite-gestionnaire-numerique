export function membreLink(uidGouvernance: string, uidMembre: string): string {
  return `/gouvernance/${uidGouvernance}/membre/${uidMembre}`
}

export function feuilleDeRouteLink(uidGouvernance: string, uidFeuilleDeRoute: string): string {
  return `/gouvernance/${uidGouvernance}/feuille-de-route/${uidFeuilleDeRoute}`
}
