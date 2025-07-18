import { Prisma } from '@prisma/client'

import { organisation, toTypologieRole, UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import prisma from '../../prisma/prismaClient'
import { Role } from '@/domain/Role'
import { MesUtilisateursLoader, UtilisateursCourantsEtTotalReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { RoleUtilisateur, UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export class PrismaUtilisateurLoader implements MesUtilisateursLoader {
  readonly #dataResource = prisma.utilisateurRecord

  async findByUid(uid: string, email?: string): Promise<UnUtilisateurReadModel> {
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
    if (!utilisateurRecord) {
      if (email !== undefined && email) {
        const doitEtreMiseAJour = await this.#dataResource.findUnique({
          include: {
            relationDepartement: true,
            relationGroupement: true,
            relationRegion: true,
            relationStructure: true,
          },
          where: {
            isSupprime: false,
            ssoId: email,
          },
        })
        if (doitEtreMiseAJour) {
          throw new Error('Doit etre mis a jour')
        }
      } else {
        throw new Error('Utilisateur non trouvé')
      }
    }
    return transform(utilisateurRecord as UtilisateurEtSesRelationsRecord)
  }

  async mesUtilisateursEtLeTotal(
    utilisateurCourant: UnUtilisateurReadModel,
    pageCourante: number,
    utilisateursParPage: number,
    utilisateursActives: boolean,
    roles: ReadonlyArray<string>,
    codeDepartement: string,
    codeRegion: string,
    idStructure?: number,
    prenomOuNomOuEmail?: string
  ): Promise<UtilisateursCourantsEtTotalReadModel> {
    const departementInexistant = '0'
    const regionInexistante = '0'
    let where: Prisma.UtilisateurRecordWhereInput = {}

    if (prenomOuNomOuEmail !== undefined) {
      where.OR = [
        { nom: { contains: prenomOuNomOuEmail, mode: 'insensitive' } },
        { prenom: { contains: prenomOuNomOuEmail, mode: 'insensitive' } },
        { emailDeContact: { contains: prenomOuNomOuEmail, mode: 'insensitive' } },
      ]
    }

    if (utilisateurCourant.role.nom === 'Gestionnaire structure') {
      where = { role: 'gestionnaire_structure' as RoleUtilisateur, structureId: utilisateurCourant.structureId }
    } else if (utilisateurCourant.role.nom === 'Gestionnaire département') {
      where = { departementCode: utilisateurCourant.departementCode, role: 'gestionnaire_departement' as RoleUtilisateur }
    } else if (utilisateurCourant.role.nom === 'Gestionnaire groupement') {
      where = { groupementId: utilisateurCourant.groupementId, role: 'gestionnaire_groupement' as RoleUtilisateur }
    } else if (utilisateurCourant.role.nom === 'Gestionnaire région') {
      where = { regionCode: utilisateurCourant.regionCode, role: 'gestionnaire_region' as RoleUtilisateur }
    } else {
      if (utilisateursActives) {
        where.NOT = { derniereConnexion: null }
      }

      if (roles.length > 0) {
        where.role = { in: roles as Array<RoleUtilisateur> }
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

      where.AND = [
        {
          structureId: idStructure,
        },
      ]
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
}

function transform(utilisateurRecord: UtilisateurEtSesRelationsRecord): UnUtilisateurReadModel {
  const role = new Role(toTypologieRole(utilisateurRecord.role), organisation(utilisateurRecord)).state

  const roleType: RoleUtilisateur = ((): RoleUtilisateur => {
    switch (utilisateurRecord.role) {
      case 'administrateur_dispositif':
      case 'gestionnaire_departement':
      case 'gestionnaire_groupement':
      case 'gestionnaire_region':
      case 'gestionnaire_structure':
        return utilisateurRecord.role
      default:
        return 'gestionnaire_structure'
    }
  })()

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
      type: roleType,
    },
    structureId: utilisateurRecord.structureId,
    telephone: utilisateurRecord.telephone,
    uid: utilisateurRecord.ssoId,
  }
}
