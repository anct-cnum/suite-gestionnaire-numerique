/* eslint-disable camelcase */
import {
  $Enums,
  DepartementRecord,
  GroupementRecord,
  RegionRecord,
  StructureRecord,
  UtilisateurRecord,
} from '@prisma/client'

import { TypologieRole } from '@/domain/Role'

export type UtilisateurEtSesRelationsRecord = Readonly<{
  relationDepartement: DepartementRecord | null
  relationGroupement: GroupementRecord | null
  relationRegion: null | RegionRecord
  relationStructure: null | StructureRecord
}> &
  UtilisateurRecord

export function toTypologieRole(role: $Enums.Role): TypologieRole {
  return typologieRoleByEnumRole[role]
}
export function fromTypologieRole(role: TypologieRole): $Enums.Role {
  return enumRoleByTypologieRole[role]
}

export function organisation(utilisateurRecord: UtilisateurEtSesRelationsRecord): string | undefined {
  switch (typologieRoleByEnumRole[utilisateurRecord.role]) {
    case 'Gestionnaire département':
      return `${utilisateurRecord.relationDepartement?.nom} (${utilisateurRecord.relationDepartement?.code})`
    case 'Gestionnaire groupement':
      return utilisateurRecord.relationGroupement?.nom
    case 'Gestionnaire région':
      return `${utilisateurRecord.relationRegion?.nom} (${utilisateurRecord.relationRegion?.code})`
    case 'Gestionnaire structure':
      return utilisateurRecord.relationStructure?.nom
    default:
      return undefined
  }
}

type TypologieRoleByEnumRole = Readonly<Record<$Enums.Role, TypologieRole>>

type EnumRoleByTypologieRole = Readonly<Record<TypologieRole, $Enums.Role>>

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
  Object.entries(typologieRoleByEnumRole).map((roleEtTypologie) => roleEtTypologie.reverse())
) as EnumRoleByTypologieRole
