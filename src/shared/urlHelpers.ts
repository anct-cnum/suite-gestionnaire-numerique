import departements from '../../ressources/departements.json'

export function feuilleDeRouteUrl(uidGouvernance: string, uidFeuilleDeRoute: string): string {
  return `/gouvernance/${uidGouvernance}/feuille-de-route/${uidFeuilleDeRoute}`
}

export function gestionMembresGouvernanceUrl(uidGouvernance: string): string {
  return `/gouvernance/${uidGouvernance}/membres`
}

export function nomDepartement(code: string): string {
  return departements.find((dept) => dept.code === code)?.nom ?? code
}
