export function toRoleViewModel(role: string): RoleViewModel {
  return {
    color: roleAndHisColor[role],
    nom: formaterLeRole[role],
  }
}

export type RoleViewModel = Readonly<{
  color: string
  nom: string
}>

// Stryker disable next-line ObjectLiteral
const formaterLeRole: Record<string, string> = {
  beneficiaire: 'Bénéficiaire',
  cofinanceur: 'Co-financeur',
  coporteur: 'Co-porteur',
  formation: 'Formation',
  observateur: 'Observateur',
  recipiendaire: 'Récipiendaire',
}

// Stryker disable next-line ObjectLiteral
const roleAndHisColor: Record<string, string> = {
  beneficiaire: 'purple-glycine',
  cofinanceur: 'warning',
  coporteur: 'info',
  formation: 'green-tilleul-verveine',
  observateur: 'beige-gris-galet',
  recipiendaire: 'green-archipel',
}
