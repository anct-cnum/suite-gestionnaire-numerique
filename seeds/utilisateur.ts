/* eslint-disable no-console */
import { Prisma, Role } from '@prisma/client'

import { coNumClient } from './co-num/coNumClient'
import prismaFNE from './fne/prismaClientFne'
import prisma from '../prisma/prismaClient'
import config from '@/use-cases/config.json'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des utilisateurs commence')

  const utilisateursCoNumRecord = await retrieveUtilisateursCoNum()
  console.log(greenColor, `${utilisateursCoNumRecord.length} utilisateurs CoNum sont récupérés`)

  const utilisateursFNERecord = await retrieveUtilisateursFNE()
  console.log(greenColor, `${utilisateursFNERecord.length} utilisateurs FNE sont récupérés`)

  const utilisateursRecord = [
    ...await transformUtilisateursCoNumToUtilisateurs(utilisateursCoNumRecord),
    ...transformUtilisateursFNEToUtilisateurs(utilisateursFNERecord),
    unUtilisateurDeTest(),
  ]
  console.log(greenColor, `${utilisateursRecord.length} utilisateurs CoNum et FNE sont transformés en utilisateurs`)

  await migrateUtilisateurs(utilisateursRecord)

  console.log(greenColor, 'La migration des utilisateurs est finie')
}

void migration()

// Nous n'avons pas tous les prénoms et noms d'un utilisateur.
// On pourra par contre leur demander de les saisir lors de leur première connexion.

// Rôles CoNum (il est censé n'y en avoir qu'un mais dans les faits, ça monte jusqu'à 3) :
// - admin -> on ne migre pas car ils se recréront manuellement
// - admin_coop -> on ne migre pas car obsolète
// - candidat -> on ne migre pas car le portail candidat n'intègre pas la suite pour le moment
// - conseiller -> on ne migre pas mais il faudra le mettre dans une table conseiller
// - coordinateur -> on ne migre pas car ils seront dans la coop de la médiation
// - grandReseau -> "Gestionnaire groupement"
// - hub -> "Gestionnaire groupement"
// - prefet -> "Gestionnaire région" si le champ "region" est rempli
//             sinon "Gestionnaire département" si le champ "departement" est rempli
// - structure -> "Gestionnaire groupement" si associé au rôle "grandReseau" ou "hub" sinon "Gestionnaire structure"
// - structure_coop -> on ne migre pas car obsolète
async function retrieveUtilisateursCoNum(): Promise<Array<UtilisateurCoNumRecord>> {
  const { db, client } = await coNumClient()

  try {
    return await db.collection('users')
      .aggregate<UtilisateurCoNumRecord>([
        {
          $match: {
            roles: { $in: ['grandReseau', 'hub', 'prefet', 'structure'] },
          },
        },
        {
          $addFields: {
            entity: {
              $arrayElemAt: [{ $objectToArray: '$entity' }, 1],
            },
          },
        },
        {
          $project: {
            _id: 0,
            createdAt: 1,
            // Le département n'est pas forcément renseigné
            departement: { $ifNull: ['$departement', ''] },
            entityId: { $toString: '$entity.v' },
            hub: { $ifNull: ['$hub', ''] },
            // L'utilisateur ne s'est pas forcément connecté
            lastLogin: { $ifNull: ['$lastLogin', null] },
            mailSentDate: 1,
            // = e-mail
            name: 1,
            // Le nom n'est pas forcément renseigné
            nom: { $ifNull: ['$nom', config.absenceNomOuPrenom] },
            // Le prénom n'est pas forcément renseigné
            prenom: { $ifNull: ['$prenom', config.absenceNomOuPrenom] },
            // La région n'est pas forcément renseignée
            region: { $ifNull: ['$region', ''] },
            reseau: { $ifNull: ['$reseau', ''] },
            roles: 1,
            // Le sub n'est pas forcément renseigné si l'utilisateur ne s'est jamais connecté ; dans ce cas, on met par
            // défaut l'email (champ $name).
            sub: { $ifNull: ['$sub', '$name'] },
          },
        },
      ])
      .toArray()
  } catch (error) {
    console.error((error as Error).message)
  } finally {
    await client.close()
  }

  return []
}

// Rôles FNE
// - administrator -> on ne migre pas car ils se recréront manuellement
// - demo -> on ne migre pas
// - prefecture_departement -> "Gestionnaire département"
// - prefecture_region -> "Gestionnaire région"
// - user -> on ne sait pas encore dans quel rôle on va les mettre
async function retrieveUtilisateursFNE(): Promise<Array<UtilisateurFNERecord>> {
  return prismaFNE.userFNE.findMany({
    select: {
      accounts: {
        select: {
          id_token: true,
        },
      },
      created: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      roleScope: true,
    },
    where: {
      OR: [{ role: 'PrefectureDepartement' }, { role: 'PrefectureRegion' }],
    },
  })
}

async function transformUtilisateursCoNumToUtilisateurs(
  utilisateursCoNumRecord: Array<UtilisateurCoNumRecord>
): Promise<Array<Prisma.UtilisateurRecordUncheckedCreateInput>> {
  const structures = await retrieveStructures()
  const groupements = await retrieveGroupements()

  return utilisateursCoNumRecord.map((utilisateurCoNumRecord): Prisma.UtilisateurRecordUncheckedCreateInput => {
    const isGestionnaireGroupementReseau = utilisateurCoNumRecord.roles.includes('grandReseau')
    const isGestionnaireGroupementHub = utilisateurCoNumRecord.roles.includes('hub')
    const isGestionnaireStructure = utilisateurCoNumRecord.roles.includes('structure')
    const isGestionnaireRegion = utilisateurCoNumRecord.roles.includes('prefet') && utilisateurCoNumRecord.region !== ''
    const isGestionnaireDepartement = utilisateurCoNumRecord.roles.includes('prefet') && utilisateurCoNumRecord.departement !== ''
    let role: Role = 'gestionnaire_structure'
    let structureId = null
    let groupementId = null
    let departementCode = null
    let regionCode = null

    if (isGestionnaireGroupementReseau) {
      role = 'gestionnaire_groupement'

      const groupement = groupements.find((groupement) => groupement.nom === utilisateurCoNumRecord.reseau)
      // @ts-expect-error
      groupementId = groupement.id
    } else if (isGestionnaireGroupementHub) {
      role = 'gestionnaire_groupement'

      const groupement = groupements.find((groupement) => groupement.nom === utilisateurCoNumRecord.hub)
      // @ts-expect-error
      groupementId = groupement.id
    } else if (isGestionnaireStructure) {
      role = 'gestionnaire_structure'

      const structure = structures.find((structureId) => structureId.idMongo === utilisateurCoNumRecord.entityId)

      // @ts-expect-error
      structureId = structure.id
    } else if (isGestionnaireRegion) {
      role = 'gestionnaire_region'

      regionCode = utilisateurCoNumRecord.region
    } else if (isGestionnaireDepartement) {
      role = 'gestionnaire_departement'

      departementCode = utilisateurCoNumRecord.departement
    }

    return {
      dateDeCreation: utilisateurCoNumRecord.createdAt,
      departementCode,
      derniereConnexion: utilisateurCoNumRecord.lastLogin,
      email: utilisateurCoNumRecord.name,
      groupementId,
      inviteLe: utilisateurCoNumRecord.mailSentDate,
      // isSuperAdmin: cette notion n'existe pas
      // isSupprime: cette notion n'existe pas
      nom: utilisateurCoNumRecord.nom,
      prenom: utilisateurCoNumRecord.prenom,
      regionCode,
      role,
      ssoId: utilisateurCoNumRecord.sub,
      structureId,
      telephone: '',
    }
  })
}

function transformUtilisateursFNEToUtilisateurs(
  utilisateursFNERecord: Array<UtilisateurFNERecord>
): Array<Prisma.UtilisateurRecordUncheckedCreateInput> {
  return utilisateursFNERecord.map((utilisateurFNERecord): Prisma.UtilisateurRecordUncheckedCreateInput => {
    const isGestionnaireRegion = utilisateurFNERecord.role === 'PrefectureRegion'
    const isGestionnaireDepartement = utilisateurFNERecord.role === 'PrefectureDepartement'
    let role: Role = 'gestionnaire_region'
    let departementCode = null
    let regionCode = null

    if (isGestionnaireRegion) {
      role = 'gestionnaire_region'

      regionCode = utilisateurFNERecord.roleScope
    } else if (isGestionnaireDepartement) {
      role = 'gestionnaire_departement'

      departementCode = utilisateurFNERecord.roleScope
    }

    const ssoId = utilisateurFNERecord.accounts.length > 0
      ? decodeJwt(utilisateurFNERecord.accounts[0].id_token).sub
      : ''

    return {
      dateDeCreation: utilisateurFNERecord.created,
      // derniereConnexion: cette notion n'existe pas
      departementCode,
      email: utilisateurFNERecord.email,
      groupementId: null,
      inviteLe: utilisateurFNERecord.created,
      // isSuperAdmin: cette notion n'existe pas
      // isSupprime: cette notion n'existe pas
      nom: utilisateurFNERecord.lastName ?? config.absenceNomOuPrenom,
      prenom: utilisateurFNERecord.firstName ?? config.absenceNomOuPrenom,
      regionCode,
      role,
      ssoId,
      structureId: null,
      telephone: '',
    }
  })
}

function unUtilisateurDeTest(): Prisma.UtilisateurRecordUncheckedCreateInput {
  const now = new Date()

  return {
    dateDeCreation: now,
    departementCode: '11',
    derniereConnexion: now,
    email: 'compte.de.test@example.com',
    groupementId: 18,
    inviteLe: now,
    isSuperAdmin: true,
    isSupprime: false,
    nom: 'Test',
    prenom: 'CompteDe',
    regionCode: '52',
    role: 'administrateur_dispositif',
    ssoId: '7396c91e-b9f2-4f9d-8547-5e9b3332725b',
    structureId: 292,
    telephone: '0102030405',
  }
}

async function migrateUtilisateurs(utilisateursRecord: Array<Prisma.UtilisateurRecordUncheckedCreateInput>) {
  await prisma.utilisateurRecord.createMany({
    data: utilisateursRecord,
    // Il peut y avoir des e-mails en commun entre CoNum et FNE
    skipDuplicates: true,
  })
}

function decodeJwt(token: string): Token {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as Token
}

async function retrieveStructures(): Promise<Array<Partial<Prisma.StructureRecordUncheckedCreateInput>>> {
  return prisma.structureRecord.findMany({
    select: {
      id: true,
      idMongo: true,
      nom: true,
    },
  })
}

async function retrieveGroupements(): Promise<Array<Prisma.GroupementRecordUncheckedCreateInput>> {
  return prisma.groupementRecord.findMany({
    select: {
      id: true,
      nom: true,
    },
  })
}

type UtilisateurCoNumRecord = Readonly<{
  createdAt: Date
  departement: string
  entityId: string
  hub: string
  lastLogin: Date
  name: string
  mailSentDate: Date
  nom: string
  prenom: string
  region: string
  roles: Array<string>
  reseau: string
  sub: string
}>

type UtilisateurFNERecord = Readonly<{
  accounts: ReadonlyArray<{
    id_token: string
  }>
  created: Date
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  roleScope: string | null
}>

type Token = Readonly<{
  sub: string
}>
