import { $Enums, Prisma } from '@prisma/client'

import { organisation, toTypologieRole, UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import { Role } from '@/domain/Role'
import { isNullish } from '@/shared/lang'
import { MesUtilisateursLoader, UtilisateursCourantsEtTotalReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { UtilisateurNonTrouveError } from '@/use-cases/queries/RechercherUnUtilisateur'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export class PrismaUtilisateurLoader implements MesUtilisateursLoader {
  readonly #dataResource: Prisma.UtilisateurRecordDelegate

  constructor(dataResource: Prisma.UtilisateurRecordDelegate) {
    this.#dataResource = dataResource
  }

  async findMesUtilisateursEtLeTotal(
    utilisateurCourant: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean,
    roles: ReadonlyArray<string>,
    codeDepartement: string,
    codeRegion: string,
    idStructure?: number,
    nomOuEmail?: string
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    const departementInexistant = '0'
    const regionInexistante = '0'
    let where: Prisma.UtilisateurRecordWhereInput = {}

    if (nomOuEmail !== undefined) {
      where.OR = [
        { nom: { contains: nomOuEmail, mode: 'insensitive' } },
        { prenom: { contains: nomOuEmail, mode: 'insensitive' } },
        { emailDeContact: { contains: nomOuEmail, mode: 'insensitive' } },
      ]
    }

    if (utilisateurCourant.role.nom === 'Gestionnaire structure') {
      where = { role: 'gestionnaire_structure', structureId: utilisateurCourant.structureId }
    } else if (utilisateurCourant.role.nom === 'Gestionnaire département') {
      where = { departementCode: utilisateurCourant.departementCode, role: 'gestionnaire_departement' }
    } else if (utilisateurCourant.role.nom === 'Gestionnaire groupement') {
      where = { groupementId: utilisateurCourant.groupementId, role: 'gestionnaire_groupement' }
    } else if (utilisateurCourant.role.nom === 'Gestionnaire région') {
      where = { regionCode: utilisateurCourant.regionCode, role: 'gestionnaire_region' }
    } else {
      if (utilisateursActives) {
        where.NOT = { derniereConnexion: null }
      }

      if (roles.length > 0) {
        where.role = { in: roles as Array<$Enums.Role> }
      }

      if (codeDepartement !== departementInexistant) {
        where.OR = [
          {
            departementCode: codeDepartement,
          },
          {
            relationStructure: {
              relationDepartement: {
                code: codeDepartement,
              },
            },
          },
        ]
      } else if (codeRegion !== regionInexistante) {
        where.OR = [
          {
            relationDepartement: {
              relationRegion: {
                code: codeRegion,
              },
            },
          },
          {
            relationStructure: {
              relationDepartement: {
                relationRegion: {
                  code: codeRegion,
                },
              },
            },
          },
          { regionCode: codeRegion },
        ]
      }

      if (!isNullish(idStructure)) {
        where.AND = [
          {
            structureId: idStructure,
          },
        ]
      }
    }

    const total = await this.#dataResource.count({
      where: {
        ...where,
        isSupprime: false,
      },
    })

    const utilisateursRecord = await this.#dataResource.findMany({
      include: {
        relationDepartement: true,
        relationGroupement: true,
        relationRegion: true,
        relationStructure: true,
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
    const utilisateurRecord = await this.#dataResource.findUnique({
      include: {
        relationDepartement: true,
        relationGroupement: true,
        relationRegion: true,
        relationStructure: true,
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
  const role = new Role(toTypologieRole(utilisateurRecord.role), organisation(utilisateurRecord)).state

  return {
    departementCode: utilisateurRecord.departementCode,
    derniereConnexion: utilisateurRecord.derniereConnexion ?? new Date(0),
    email: utilisateurRecord.emailDeContact,
    groupementId: utilisateurRecord.groupementId,
    inviteLe: utilisateurRecord.inviteLe,
    isActive: utilisateurRecord.derniereConnexion !== null,
    isGestionnaireDepartement: role.nom === 'Gestionnaire département',
    isSuperAdmin: utilisateurRecord.isSuperAdmin,
    nom: utilisateurRecord.nom,
    prenom: utilisateurRecord.prenom,
    regionCode: utilisateurRecord.regionCode,
    role: {
      categorie: role.categorie,
      doesItBelongToGroupeAdmin: role.groupe === 'admin',
      nom: role.nom,
      organisation: role.organisation,
      rolesGerables: role.rolesGerables,
    },
    structureId: utilisateurRecord.structureId,
    telephone: utilisateurRecord.telephone,
    uid: utilisateurRecord.ssoId,
  }
}
