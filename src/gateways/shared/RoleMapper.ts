import {
  DepartementRecord,
  GroupementRecord,
  RegionRecord,
  StructureRecord,
  UtilisateurRecord,
  $Enums,
} from '@prisma/client'

import { TypologieRole } from '@/domain/Role'

export type UtilisateurEtSesRelationsRecord = UtilisateurRecord &
  Readonly<{
    relationDepartement: DepartementRecord | null
    relationGroupement: GroupementRecord | null
    relationRegion: RegionRecord | null
    relationStructure: StructureRecord | null
  }>

type TypologieRoleByEnumRole = Readonly<Record<$Enums.Role, TypologieRole>>
type EnumRoleByTypologieRole = Readonly<Record<TypologieRole, $Enums.Role>>

export function toTypologieRole(role: $Enums.Role): TypologieRole {
  return typologieRoleByEnumRole[role]
}

export function fromTypologieRole(role: TypologieRole): $Enums.Role {
  return enumRoleByTypologieRole[role]
}

export function organisation(utilisateurRecord: UtilisateurEtSesRelationsRecord): string | undefined {
  switch (typologieRoleByEnumRole[utilisateurRecord.role]) {
    case 'Gestionnaire département':
      return utilisateurRecord.relationDepartement?.nom
    case 'Gestionnaire région':
      return utilisateurRecord.relationRegion?.nom
    case 'Gestionnaire groupement':
      return utilisateurRecord.relationGroupement?.nom
    case 'Gestionnaire structure':
      return utilisateurRecord.relationStructure?.nom
    default:
      return undefined
  }
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

const enumRoleByTypologieRole = Object.fromEntries(
  Object.entries(typologieRoleByEnumRole).map(((roleEtTypologie) => roleEtTypologie.reverse()))
) as EnumRoleByTypologieRole
