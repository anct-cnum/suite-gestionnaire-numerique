import { $Enums, PrismaClient, UtilisateurRecord } from '@prisma/client'

import { categorieByType, TypologieRole } from '@/domain/Role'
import { UtilisateurNonTrouveError, UtilisateurQuery, UtilisateurReadModel } from '@/use-cases/queries/UtilisateurQuery'

export class PostgreUtilisateurQuery implements UtilisateurQuery {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async count(): Promise<number> {
    return this.#prisma.utilisateurRecord.count()
  }

  async findAll(pageCourante = 0, utilisateursParPage = 10): Promise<Array<UtilisateurReadModel>> {
    const utilisateursRecord = await this.#prisma.utilisateurRecord.findMany({
      orderBy: {
        nom: 'asc',
      },
      skip: utilisateursParPage * pageCourante,
      take: utilisateursParPage,
      where: {
        isSupprime: false,
      },
    })

    return utilisateursRecord.map((utilisateurRecord): UtilisateurReadModel => {
      return transform(utilisateurRecord)
    })
  }

  async findBySsoId(ssoId: string): Promise<UtilisateurReadModel> {
    const utilisateurRecord = await this.#prisma.utilisateurRecord.findUnique({
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

function transform(utilisateurRecord: UtilisateurRecord): UtilisateurReadModel {
  type Mapping = Readonly<Record<$Enums.Role, { nom: TypologieRole, territoireOuStructure: string }>>

  const mapping: Mapping = {
    administrateur_dispositif: {
      nom: 'Administrateur dispositif',
      territoireOuStructure: 'Dispositif lambda',
    },
    gestionnaire_departement: {
      nom: 'Gestionnaire département',
      territoireOuStructure: 'Rhône',
    },
    gestionnaire_groupement: {
      nom: 'Gestionnaire groupement',
      territoireOuStructure: 'Hubikoop',
    },
    gestionnaire_region: {
      nom: 'Gestionnaire région',
      territoireOuStructure: 'Auvergne-Rhône-Alpes',
    },
    gestionnaire_structure: {
      nom: 'Gestionnaire structure',
      territoireOuStructure: 'Solidarnum',
    },
    instructeur: {
      nom: 'Instructeur',
      territoireOuStructure: '',
    },
    pilote_politique_publique: {
      nom: 'Pilote politique publique',
      territoireOuStructure: '',
    },
    support_animation: {
      nom: 'Support animation',
      territoireOuStructure: '',
    },
  }

  return {
    derniereConnexion: utilisateurRecord.derniereConnexion ?? new Date(0),
    email: utilisateurRecord.email,
    inviteLe: utilisateurRecord.inviteLe,
    isActive: utilisateurRecord.derniereConnexion !== null ? true : false,
    isSuperAdmin: utilisateurRecord.isSuperAdmin,
    nom: utilisateurRecord.nom,
    prenom: utilisateurRecord.prenom,
    role: {
      categorie: categorieByType[mapping[utilisateurRecord.role].nom],
      nom: mapping[utilisateurRecord.role].nom,
      territoireOuStructure: mapping[utilisateurRecord.role].territoireOuStructure,
    },
    uid: utilisateurRecord.ssoId,
  }
}
