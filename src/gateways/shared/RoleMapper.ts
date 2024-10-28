import {
  $Enums,
  DepartementRecord,
  GroupementRecord,
  RegionRecord,
  StructureRecord,
  UtilisateurRecord,
} from '@prisma/client'

import { Groupe, TypologieRole } from '@/domain/Role'

export type UtilisateurEtSesRelationsRecord = UtilisateurRecord &
  Readonly<{
    relationDepartement: DepartementRecord | null
    relationGroupement: GroupementRecord | null
    relationRegion: RegionRecord | null
    relationStructure: StructureRecord | null
  }>

export type RoleMapping = Readonly<
  Record<$Enums.Role, { nom: TypologieRole; groupe: Groupe; territoireOuStructure: string }>
>

export function roleMapper(utilisateurRecord: UtilisateurEtSesRelationsRecord): RoleMapping {
  return {
    administrateur_dispositif: {
      groupe: 'admin',
      nom: 'Administrateur dispositif',
      territoireOuStructure: 'Administrateur Dispositif lambda',
    },
    gestionnaire_departement: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire département',
      territoireOuStructure: utilisateurRecord.relationDepartement?.nom ?? '',
    },
    gestionnaire_groupement: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire groupement',
      territoireOuStructure: utilisateurRecord.relationGroupement?.nom ?? '',
    },
    gestionnaire_region: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire région',
      territoireOuStructure: utilisateurRecord.relationRegion?.nom ?? '',
    },
    gestionnaire_structure: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire structure',
      territoireOuStructure: utilisateurRecord.relationStructure?.nom ?? '',
    },
    instructeur: {
      groupe: 'admin',
      nom: 'Instructeur',
      territoireOuStructure: 'Banque des territoires',
    },
    pilote_politique_publique: {
      groupe: 'admin',
      nom: 'Pilote politique publique',
      territoireOuStructure: 'France Numérique Ensemble',
    },
    support_animation: {
      groupe: 'admin',
      nom: 'Support animation',
      territoireOuStructure: 'Mednum',
    },
  }
}
