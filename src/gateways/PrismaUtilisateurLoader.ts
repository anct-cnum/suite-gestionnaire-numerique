import { Prisma } from '@prisma/client'

import { organisation, toTypologieRole, UtilisateurEtSesRelationsRecord } from './shared/RoleMapper'
import prisma from '../../prisma/prismaClient'
import { Role } from '@/domain/Role'
import { isNullishOrEmpty } from '@/shared/lang'
import { MesUtilisateursLoader, UtilisateursCourantsEtTotalReadModel } from '@/use-cases/queries/RechercherMesUtilisateurs'
import { RoleUtilisateur, UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export class PrismaUtilisateurLoader implements MesUtilisateursLoader {
  readonly #dataResource = prisma.utilisateurRecord

  async findByUid(uid: string, email?: string): Promise<UnUtilisateurReadModel> {
    const includeRelations = {
      relationDepartement: true,
      relationGroupement: true,
      relationRegion: true,
      relationStructure: {
        include: {
          membres: {
            select: {
              gouvernanceDepartementCode: true,
            },
            take: 1,
            where: {
              statut: 'confirme',
            },
          },
        },
      },
    }

    // 1. Recherche par ssoId (cas nominal)
    const utilisateurParSsoId = await this.#dataResource.findUnique({
      include: includeRelations,
      where: {
        isSupprime: false,
        ssoId: uid,
      },
    })

    if (utilisateurParSsoId) {
      return transform(utilisateurParSsoId as UtilisateurAvecMembresRecord)
    }

    // 2. Fallback : recherche par email (ssoEmail est l'email venant de ProConnect)
    if (!isNullishOrEmpty(email)) {
      const utilisateurParEmail = await this.#dataResource.findUnique({
        include: includeRelations,
        where: {
          isSupprime: false,
          ssoEmail: email,
        },
      })

      if (utilisateurParEmail) {
        // L'utilisateur existe mais son ssoId a changé (ou première connexion)
        throw new Error('Doit etre mis a jour')
      }
    }

    throw new Error('Utilisateur non trouvé')
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
    // Recherche flexible par nom/prénom/email avec word_similarity
    let ssoIdsFromSearch: ReadonlyArray<string> | undefined
    if (prenomOuNomOuEmail !== undefined) {
      ssoIdsFromSearch = await this.#rechercheFlexibleUtilisateurs(prenomOuNomOuEmail)
      if (ssoIdsFromSearch.length === 0) {
        return { total: 0, utilisateursCourants: [] }
      }
    }

    const where = await this.#construireFiltreWhere(
      utilisateurCourant,
      utilisateursActives,
      roles,
      codeDepartement,
      codeRegion,
      idStructure,
      ssoIdsFromSearch
    )

    const total = await this.#dataResource.count({
      where: {
        ...where,
        isSupprime: false,
      },
    })

    const includeRelations = {
      relationDepartement: true,
      relationGroupement: true,
      relationRegion: true,
      relationStructure: {
        include: {
          adresse: true,
          membres: {
            select: {
              gouvernanceDepartementCode: true,
            },
            take: 1,
            where: {
              statut: 'confirme',
            },
          },
        },
      },
    } as const

    // Si recherche flexible, pagination et tri gérés via les IDs pré-triés par pertinence
    if (ssoIdsFromSearch !== undefined) {
      const ssoIdsPagines = ssoIdsFromSearch.slice(
        utilisateursParPage * pageCourante,
        utilisateursParPage * (pageCourante + 1)
      )

      const utilisateursRecord = await this.#dataResource.findMany({
        include: includeRelations,
        where: {
          ...where,
          isSupprime: false,
          ssoId: { in: [...ssoIdsPagines] },
        },
      })

      // Réordonner selon l'ordre de pertinence
      const utilisateursTries = this.#trierParPertinence(utilisateursRecord, ssoIdsFromSearch)

      return {
        total,
        utilisateursCourants: utilisateursTries.map(transform),
      }
    }

    const utilisateursRecord = await this.#dataResource.findMany({
      include: includeRelations,
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

  async #construireFiltreWhere(
    utilisateurCourant: UnUtilisateurReadModel,
    utilisateursActives: boolean,
    roles: ReadonlyArray<string>,
    codeDepartement: string,
    codeRegion: string,
    idStructure?: number,
    ssoIdsFromSearch?: ReadonlyArray<string>
  ): Promise<Prisma.UtilisateurRecordWhereInput> {
    const departementInexistant = '0'
    const regionInexistante = '0'
    const where: Prisma.UtilisateurRecordWhereInput = {}

    if (ssoIdsFromSearch !== undefined) {
      where.ssoId = { in: [...ssoIdsFromSearch] }
    }

    if (utilisateurCourant.role.nom === 'Gestionnaire structure') {
      where.role = 'gestionnaire_structure' as RoleUtilisateur
      where.structureId = utilisateurCourant.structureId
      return where
    }

    if (utilisateurCourant.role.nom === 'Gestionnaire département') {
      where.departementCode = utilisateurCourant.departementCode
      where.role = 'gestionnaire_departement' as RoleUtilisateur
      return where
    }

    if (utilisateurCourant.role.nom === 'Gestionnaire groupement') {
      where.groupementId = utilisateurCourant.groupementId
      where.role = 'gestionnaire_groupement' as RoleUtilisateur
      return where
    }

    if (utilisateurCourant.role.nom === 'Gestionnaire région') {
      where.regionCode = utilisateurCourant.regionCode
      where.role = 'gestionnaire_region' as RoleUtilisateur
      return where
    }

    // Admin ou autre rôle : filtres avancés
    if (utilisateursActives) {
      where.NOT = { derniereConnexion: null }
    }

    if (roles.length > 0) {
      where.role = { in: roles as Array<RoleUtilisateur> }
    }

    if (codeDepartement !== departementInexistant) {
      where.OR = [
        { departementCode: codeDepartement },
        { relationStructure: { adresse: { departement: codeDepartement } } },
      ]
    } else if (codeRegion !== regionInexistante) {
      where.OR = [
        { relationDepartement: { relationRegion: { code: codeRegion } } },
        { relationStructure: { adresse: { departement: { in: await this.#getDepartementsInRegion(codeRegion) } } } },
        { regionCode: codeRegion },
      ]
    }

    where.AND = [{ structureId: idStructure }]

    return where
  }

  async #getDepartementsInRegion(codeRegion: string): Promise<Array<string>> {
    const departements = await prisma.departementRecord.findMany({
      select: {
        code: true,
      },
      where: {
        regionCode: codeRegion,
      },
    })
    return departements.map((departement) => departement.code)
  }

  async #rechercheFlexibleUtilisateurs(match: string): Promise<ReadonlyArray<string>> {
    const mots = match
      .trim()
      .split(/\s+/)
      .filter((mot) => mot.length > 0)

    if (mots.length === 0) {
      return []
    }

    // Pour chaque mot, il doit matcher dans au moins un des champs (nom, prenom, email)
    const conditionsMots = mots
      .map((_, index) => `(
        public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(u.nom))) > 0.4
        OR public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(u.prenom))) > 0.4
        OR public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(u.email_de_contact))) > 0.4
      )`)
      .join(' AND ')

    // Score = meilleure similarité parmi les 3 champs pour chaque mot, puis moyenne
    const scoreCalcul = mots
      .map((_, index) => `GREATEST(
        public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(u.nom))),
        public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(u.prenom))),
        public.word_similarity(public.unaccent(lower($${index + 1})), public.unaccent(lower(u.email_de_contact)))
      )`)
      .join(' + ')
    const scoreMoyen = `(${scoreCalcul}) / ${mots.length}`

    const query = `
      SELECT u.sso_id
      FROM min.utilisateur u
      WHERE (${conditionsMots})
        AND u.is_supprime = false
      ORDER BY ${scoreMoyen} DESC, u.nom ASC
    `

    interface RawResult { sso_id: string }
    const results = await prisma.$queryRawUnsafe<Array<RawResult>>(query, ...mots)

    return results.map((row) => row.sso_id)
  }

  #trierParPertinence<T extends { ssoId: string }>(
    utilisateurs: Array<T>,
    ordreParPertinence: ReadonlyArray<string>
  ): Array<T> {
    const indexParSsoId = new Map(ordreParPertinence.map((ssoId, index) => [ssoId, index]))
    return [...utilisateurs].sort((utilisateurA, utilisateurB) => {
      const indexA = indexParSsoId.get(utilisateurA.ssoId) ?? Number.MAX_SAFE_INTEGER
      const indexB = indexParSsoId.get(utilisateurB.ssoId) ?? Number.MAX_SAFE_INTEGER
      return indexA - indexB
    })
  }
}

type UtilisateurAvecMembresRecord = {
  relationStructure: ({
    membres: ReadonlyArray<{ gouvernanceDepartementCode: string }>
  } & UtilisateurEtSesRelationsRecord['relationStructure']) | null
} & Omit<UtilisateurEtSesRelationsRecord, 'relationStructure'>

function transform(utilisateurRecord: UtilisateurAvecMembresRecord): UnUtilisateurReadModel {
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

  // Pour un gestionnaire de structure, récupérer le code département depuis les membres de gouvernance
  const departementCode = role.nom === 'Gestionnaire structure'
    ? utilisateurRecord.relationStructure?.membres[0]?.gouvernanceDepartementCode ?? null
    : utilisateurRecord.departementCode

  return {
    departementCode,
    derniereConnexion: utilisateurRecord.derniereConnexion ?? new Date(0),
    displayMenusPilotage: role.nom === 'Gestionnaire département' || role.nom === 'Gestionnaire structure',
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

