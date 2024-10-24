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
    relationDepartements: DepartementRecord | null
    relationGroupements: GroupementRecord | null
    relationRegions: RegionRecord | null
    relationStructures: StructureRecord | null
  }>

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

const enumRoleByTypologieRole = Object.fromEntries(
  Object.entries(typologieRoleByEnumRole).map(((roleEtTypologie) => roleEtTypologie.reverse()))
) as EnumRoleByTypologieRole
