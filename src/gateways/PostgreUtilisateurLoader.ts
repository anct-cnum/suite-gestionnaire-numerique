import { $Enums, DepartementRecord, GroupementRecord, PrismaClient, RegionRecord, StructureRecord, UtilisateurRecord } from '@prisma/client'

import { categorieByType, Groupe, TypologieRole } from '@/domain/Role'
import { MesUtilisateursLoader, MesUtilisateursReadModel, UtilisateursCourantsEtTotalReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { UnUtilisateurReadModel, UtilisateurNonTrouveError } from '@/use-cases/queries/RechercherUnUtilisateur'

export class PostgreUtilisateurLoader implements MesUtilisateursLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async findMesUtilisateursEtLeTotal(
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    let where: Record<string, string | boolean | number | null> = {}

    if (utilisateur.role.nom === 'Gestionnaire structure') {
      where = { role: 'gestionnaire_structure', structureId: utilisateur.structureId }
    } else if (utilisateur.role.nom === 'Gestionnaire département') {
      where = { departementCode: utilisateur.departementCode, role: 'gestionnaire_departement' }
    } else if (utilisateur.role.nom === 'Gestionnaire groupement') {
      where = { groupementId: utilisateur.groupementId, role: 'gestionnaire_groupement' }
    } else if (utilisateur.role.nom === 'Gestionnaire région') {
      where = { regionCode: utilisateur.regionCode, role: 'gestionnaire_region' }
    }

    const total = await this.#prisma.utilisateurRecord.count({
      where: {
        isSupprime: false,
        ...where,
      },
    })

    const utilisateursRecord = await this.#prisma.utilisateurRecord.findMany({
      include: {
        relationDepartements: true,
        relationGroupements: true,
        relationRegions: true,
        relationStructures: true,
      },
      orderBy: {
        nom: 'asc',
      },
      skip: utilisateursParPage * pageCourante,
      take: utilisateursParPage,
      where: {
        isSupprime: false,
        ...where,
      },
    })

    return {
      total,
      utilisateursCourants: utilisateursRecord.map(transform),
    }
  }

  async findBySsoId(ssoId: string): Promise<UnUtilisateurReadModel> {
    const utilisateurRecord = await this.#prisma.utilisateurRecord.findUnique({
      include: {
        relationDepartements: true,
        relationGroupements: true,
        relationRegions: true,
        relationStructures: true,
      },
      where: {
        isSupprime: false,
        ssoId,
      },
    })

    if (utilisateurRecord === null) {
      throw new UtilisateurNonTrouveError()
    }

    return transform(utilisateurRecord)
  }
}

function transform(utilisateurRecord: UtilisateurEtSesRelationsRecord): MesUtilisateursReadModel {
  type Mapping = Readonly<Record<$Enums.Role, { nom: TypologieRole, groupe: Groupe, territoireOuStructure: string }>>

  const mapping: Mapping = {
    administrateur_dispositif: {
      groupe: 'admin',
      nom: 'Administrateur dispositif',
      territoireOuStructure: 'Administrateur Dispositif lambda',
    },
    gestionnaire_departement: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire département',
      territoireOuStructure: utilisateurRecord.relationDepartements?.nom ?? '',
    },
    gestionnaire_groupement: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire groupement',
      territoireOuStructure: utilisateurRecord.relationGroupements?.nom ?? '',
    },
    gestionnaire_region: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire région',
      territoireOuStructure: utilisateurRecord.relationRegions?.nom ?? '',
    },
    gestionnaire_structure: {
      groupe: 'gestionnaire',
      nom: 'Gestionnaire structure',
      territoireOuStructure: utilisateurRecord.relationStructures?.nom ?? '',
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

  return {
    departementCode: utilisateurRecord.departementCode,
    derniereConnexion: utilisateurRecord.derniereConnexion ?? new Date(0),
    email: utilisateurRecord.email,
    groupementId: utilisateurRecord.groupementId,
    inviteLe: utilisateurRecord.inviteLe,
    isActive: utilisateurRecord.derniereConnexion !== null,
    isSuperAdmin: utilisateurRecord.isSuperAdmin,
    nom: utilisateurRecord.nom,
    prenom: utilisateurRecord.prenom,
    regionCode: utilisateurRecord.regionCode,
    role: {
      categorie: categorieByType[mapping[utilisateurRecord.role].nom],
      groupe: mapping[utilisateurRecord.role].groupe,
      nom: mapping[utilisateurRecord.role].nom,
      territoireOuStructure: mapping[utilisateurRecord.role].territoireOuStructure,
    },
    structureId: utilisateurRecord.structureId,
    uid: utilisateurRecord.ssoId,
  }
}

type UtilisateurEtSesRelationsRecord = UtilisateurRecord & Readonly<{
  relationDepartements: DepartementRecord | null
  relationGroupements: GroupementRecord | null
  relationRegions: RegionRecord | null
  relationStructures: StructureRecord | null
}>
