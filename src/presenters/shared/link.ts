export function membreLink(structureId: number): string {
  return `/structure/${structureId}`
}

export function feuilleDeRouteLink(uidGouvernance: string, uidFeuilleDeRoute: string): string {
  return `/gouvernance/${uidGouvernance}/feuille-de-route/${uidFeuilleDeRoute}`
}

export function documentfeuilleDeRouteLink(nomDocument: string): string {
  return `/api/document-feuille-de-route/${nomDocument}`
}
