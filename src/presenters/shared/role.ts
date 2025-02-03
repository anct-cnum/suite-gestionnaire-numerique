export function toRoleViewModel(role: string): RoleViewModel {
  const roleFormater = formaterLeRoleViewModel(role)
  return {
    color: roleAndHisColor[roleFormater],
    nom: roleFormater,
  }
}

export function formaterLeRoleViewModel(role: string): string {
  return formaterLeRole[role]
}

type RoleViewModel = Readonly<{
  color: string
  nom: string
}>

// Stryker disable next-line ObjectLiteral
const formaterLeRole: Record<string, string> = {
  Formation: 'Formation',
  beneficiaire: 'Bénéficiaire',
  cofinanceur: 'Co-financeur',
  coporteur: 'Co-porteur',
  observateur: 'Observateur',
  recipiendaire: 'Récipiendaire',
}

// Stryker disable next-line ObjectLiteral
const roleAndHisColor: Record<string, string> = {
  Bénéficiaire: 'purple-glycine',
  'Co-financeur': 'warning',
  'Co-porteur': 'info',
  Formation: 'green-tilleul-verveine',
  Observateur: 'beige-gris-galet',
  Porteur: 'info',
  Récipiendaire: 'green-archipel',
}
