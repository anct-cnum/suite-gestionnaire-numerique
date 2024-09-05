import { $Enums } from '@prisma/client'

import { TypologieRole } from '@/domain/Role'

type TypologieRoleByEnumRole = Readonly<Record<$Enums.Role, TypologieRole>>
type EnumRoleByTypologieRole = Readonly<Record<TypologieRole, $Enums.Role>>

export function toTypologieRole(role: $Enums.Role): TypologieRole {
  return typologieRoleByEnumRole[role]
}

export function fromTypologieRole(role: TypologieRole): $Enums.Role {
  return enumRoleByTypologieRole[role]
}

const typologieRoleByEnumRole: TypologieRoleByEnumRole = {
  administrateur_dispositif: 'Administrateur dispositif',
  gestionnaire_departement: 'Gestionnaire département',
  gestionnaire_groupement: 'Gestionnaire groupement',
  gestionnaire_region: 'Gestionnaire région',
  gestionnaire_structure: 'Gestionnaire structure',
  instructeur: 'Instructeur',
  pilote_politique_publique: 'Pilote politique publique',
  support_animation: 'Support animation',
}

const enumRoleByTypologieRole = Object.entries(typologieRoleByEnumRole)
  .reduce((enumRoleByTypologieRole, [enumsRole, typologieRole]) => ({
    ...enumRoleByTypologieRole,
    [typologieRole]: enumsRole,
  }), {}) as EnumRoleByTypologieRole
