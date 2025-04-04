export function membreLink(uidGouvernance: string, uidMembre: string): string {
  return `/gouvernance/${uidGouvernance}/membre/${uidMembre}`
}

export function feuilleDeRouteLink(uidGouvernance: string, uidFeuilleDeRoute: string): string {
  return `/gouvernance/${uidGouvernance}/feuille-de-route/${uidFeuilleDeRoute}`
}

export function documentfeuilleDeRouteLink(nomDocument: string): string {
  return `/api/document-feuille-de-route/${nomDocument}`
}
