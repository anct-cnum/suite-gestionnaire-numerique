import { Prisma, PrismaClient } from '@prisma/client'

import { toTypologieRole, UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import { Utilisateur } from '@/domain/Utilisateur'
import {
  MesUtilisateursLoader,
  UtilisateursCourantsEtTotalReadModel,
} from '@/use-cases/queries/RechercherMesUtilisateurs'
import { UtilisateurNonTrouveError } from '@/use-cases/queries/RechercherUnUtilisateur'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export class PostgreUtilisateurLoader implements MesUtilisateursLoader {
  readonly #prisma: PrismaClient

  constructor(prisma: PrismaClient) {
    this.#prisma = prisma
  }

  async findMesUtilisateursEtLeTotal(
    utilisateur: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean,
    roles: ReadonlyArray<string>
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    let where: Prisma.UtilisateurRecordWhereInput = {}

    if (utilisateur.role.nom === 'Gestionnaire structure') {
      where = { role: 'gestionnaire_structure', structureId: utilisateur.structureId }
    } else if (utilisateur.role.nom === 'Gestionnaire département') {
      where = { departementCode: utilisateur.departementCode, role: 'gestionnaire_departement' }
    } else if (utilisateur.role.nom === 'Gestionnaire groupement') {
      where = { groupementId: utilisateur.groupementId, role: 'gestionnaire_groupement' }
    } else if (utilisateur.role.nom === 'Gestionnaire région') {
      where = { regionCode: utilisateur.regionCode, role: 'gestionnaire_region' }
    } else {
      if (utilisateursActives) {
        where = { ...where, NOT: { derniereConnexion: null } }
      }

      if (roles.length > 0) {
        // @ts-expect-error
        where = { ...where, role: { in: roles } }
      }
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

  async findByUid(uid: string): Promise<UnUtilisateurReadModel> {
    const utilisateurRecord = await this.#prisma.utilisateurRecord.findUnique({
      include: {
        relationDepartements: true,
        relationGroupements: true,
        relationRegions: true,
        relationStructures: true,
      },
      where: {
        isSupprime: false,
        ssoId: uid,
      },
    })

    if (utilisateurRecord === null) {
      throw new UtilisateurNonTrouveError()
    }

    return transform(utilisateurRecord)
  }
}

function transform(utilisateurRecord: UtilisateurEtSesRelationsRecord): UnUtilisateurReadModel {
  return {
    ...Utilisateur.fromOrganisations(
      {
        email: utilisateurRecord.email,
        isSuperAdmin: false,
        nom: utilisateurRecord.nom,
        prenom: utilisateurRecord.prenom,
        role: toTypologieRole(utilisateurRecord.role),
        telephone: utilisateurRecord.telephone,
        uid: utilisateurRecord.ssoId,
      },
      {
        departement: utilisateurRecord.relationDepartements?.nom,
        groupement: utilisateurRecord.relationGroupements?.nom,
        region: utilisateurRecord.relationRegions?.nom,
        structure: utilisateurRecord.relationStructures?.nom,
      }
    ).state(),
    departementCode: utilisateurRecord.departementCode,
    derniereConnexion: utilisateurRecord.derniereConnexion ?? new Date(0),
    groupementId: utilisateurRecord.groupementId,
    inviteLe: utilisateurRecord.inviteLe,
    isActive: utilisateurRecord.derniereConnexion !== null,
    regionCode: utilisateurRecord.regionCode,
    structureId: utilisateurRecord.structureId,
    uid: utilisateurRecord.ssoId,
  }
}
