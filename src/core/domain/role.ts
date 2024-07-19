const ROLES = [
  'Administrateur dispositif',
  'Gestionnaire département',
  'Gestionnaire groupement',
  'Gestionnaire région',
  'Gestionnaire structure',
  'Instructeur',
  'Pilote politique publique',
  'Support animation',
] as const

type TypologieRole = typeof ROLES[number]

class Role {
  readonly typologie: TypologieRole
  readonly perimetre: string
  constructor(typologie: TypologieRole, perimetre = '') {
    this.typologie = typologie
    this.perimetre = perimetre
  }
}

export { Role, ROLES, type TypologieRole }

