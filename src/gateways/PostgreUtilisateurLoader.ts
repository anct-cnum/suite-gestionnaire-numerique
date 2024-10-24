import { $Enums, Prisma, PrismaClient } from '@prisma/client'

import { roleMapper, UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import departements from '../../ressources/departements.json'
import { categorieByType } from '@/domain/Role'
import { MesUtilisateursLoader, UtilisateursCourantsEtTotalReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'
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
    roles: ReadonlyArray<string>,
    codeDepartement: string,
    codeRegion: string
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    const departementInexistant = '0'
    const regionInexistante = '0'
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
        where.NOT = { derniereConnexion: null }
      }

      if (roles.length > 0) {
        where.role = { in: roles as Array<$Enums.Role> }
      }

      if (codeDepartement !== departementInexistant) {
        where.departementCode = codeDepartement
      } else if (codeRegion !== regionInexistante) {
        where.OR = [
          {
            departementCode: {
              in: departements
                .filter((departement) => departement.regionCode === codeRegion)
                .map((departement) => departement.code),
            },
          },
          { regionCode: codeRegion },
        ]
      }
    }

    const total = await this.#prisma.utilisateurRecord.count({
      where: {
        ...where,
        isSupprime: false,
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
        ...where,
        isSupprime: false,
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
      categorie: categorieByType[roleMapper(utilisateurRecord)[utilisateurRecord.role].nom],
      groupe: roleMapper(utilisateurRecord)[utilisateurRecord.role].groupe,
      nom: roleMapper(utilisateurRecord)[utilisateurRecord.role].nom,
      territoireOuStructure: roleMapper(utilisateurRecord)[utilisateurRecord.role].territoireOuStructure,
    },
    structureId: utilisateurRecord.structureId,
    telephone: utilisateurRecord.telephone,
    uid: utilisateurRecord.ssoId,
  }
}
