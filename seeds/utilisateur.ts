/* eslint-disable no-console */
import { Prisma, Role } from '@prisma/client'

import { coNumClient } from './co-num/coNumClient'
import prismaFNE from './fne/prismaClientFne'
import prisma from '../prisma/prismaClient'

async function migration() {
  const greenColor = '\x1b[32m%s\x1b[0m'

  console.log(greenColor, 'La migration des utilisateurs commence')

  const utilisateursCoNumRecord = await retrieveUtilisateursCoNum()
  console.log(greenColor, `${utilisateursCoNumRecord.length} utilisateurs CoNum sont récupérés`)

  const utilisateursFNERecord = await retrieveUtilisateursFNE()
  console.log(greenColor, `${utilisateursFNERecord.length} utilisateurs FNE sont récupérés`)

  const utilisateursRecord = [
    ...transformUtilisateursCoNumToUtilisateurs(utilisateursCoNumRecord),
    ...transformUtilisateursFNEToUtilisateurs(utilisateursFNERecord),
    ajouterUnUtilisateurDeTest(),
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
          $project: {
            _id: 0,
            createdAt: 1,
            // Le département n'est pas forcément renseigné
            departement: { $ifNull: ['$departement', ''] },
            // L'utilisateur ne s'est pas forcément connecté
            lastLogin: { $ifNull: ['$lastLogin', null] },
            mailSentDate: 1,
            // = e-mail
            name: 1,
            // Le nom n'est pas forcément renseigné
            nom: { $ifNull: ['$nom', ''] },
            // Le prénom n'est pas forcément renseigné
            prenom: { $ifNull: ['$prenom', ''] },
            // La région n'est pas forcément renseignée
            region: { $ifNull: ['$region', ''] },
            roles: 1,
            // Le sub n'est pas forcément renseigné si l'utilisateur ne s'est jamais connecté
            sub: { $ifNull: ['$sub', ''] },
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
    },
    where: {
      OR: [{ role: 'PrefectureDepartement' }, { role: 'PrefectureRegion' }],
    },
  })
}

function transformUtilisateursCoNumToUtilisateurs(
  utilisateursCoNumRecord: Array<UtilisateurCoNumRecord>
): Array<Prisma.UtilisateurRecordUncheckedCreateInput> {
  return utilisateursCoNumRecord.map((utilisateurCoNumRecord): Prisma.UtilisateurRecordUncheckedCreateInput => {
    const isGestionnaireGroupement = utilisateurCoNumRecord.roles.includes('grandReseau') || utilisateurCoNumRecord.roles.includes('hub')
    const isGestionnaireStructure = utilisateurCoNumRecord.roles.includes('structure')
    const isGestionnaireRegion = utilisateurCoNumRecord.roles.includes('prefet') && utilisateurCoNumRecord.region !== ''
    const isGestionnaireDepartement = utilisateurCoNumRecord.roles.includes('prefet') && utilisateurCoNumRecord.departement !== ''
    let role: Role = 'gestionnaire_structure'

    if (isGestionnaireGroupement) {
      role = 'gestionnaire_groupement'
    } else if (isGestionnaireStructure) {
      role = 'gestionnaire_structure'
    } else if (isGestionnaireRegion) {
      role = 'gestionnaire_region'
    } else if (isGestionnaireDepartement) {
      role = 'gestionnaire_departement'
    }

    return {
      dateDeCreation: utilisateurCoNumRecord.createdAt,
      derniereConnexion: utilisateurCoNumRecord.lastLogin,
      email: utilisateurCoNumRecord.name,
      inviteLe: utilisateurCoNumRecord.mailSentDate,
      // isSuperAdmin: cette notion n'existe pas
      // isSupprime: cette notion n'existe pas
      nom: utilisateurCoNumRecord.nom,
      prenom: utilisateurCoNumRecord.prenom,
      role,
      sub: utilisateurCoNumRecord.sub,
      // telephone: cette notion n'existe pas
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

    if (isGestionnaireRegion) {
      role = 'gestionnaire_region'
    } else if (isGestionnaireDepartement) {
      role = 'gestionnaire_departement'
    }

    const sub = utilisateurFNERecord.accounts.length > 0
      ? decodeJwt(utilisateurFNERecord.accounts[0].id_token).sub
      : ''

    return {
      dateDeCreation: utilisateurFNERecord.created,
      // derniereConnexion: cette notion n'existe pas
      email: utilisateurFNERecord.email,
      inviteLe: utilisateurFNERecord.created,
      // isSuperAdmin: cette notion n'existe pas
      // isSupprime: cette notion n'existe pas
      nom: utilisateurFNERecord.lastName ?? '',
      prenom: utilisateurFNERecord.firstName ?? '',
      role,
      sub,
      // telephone: cette notion n'existe pas
    }
  })
}

function ajouterUnUtilisateurDeTest(): Prisma.UtilisateurRecordUncheckedCreateInput {
  const date = new Date()

  return {
    dateDeCreation: date,
    derniereConnexion: date,
    email: 'compte.de.test@example.com',
    inviteLe: date,
    isSuperAdmin: true,
    // isSupprime: false --> inutile, par défaut à false
    nom: 'Test',
    prenom: 'CompteDe',
    role: 'administrateur_dispositif',
    sub: '7396c91e-b9f2-4f9d-8547-5e9b3332725b',
    telephone: '0102030405',
  }
}

async function migrateUtilisateurs(utilisateursRecord: Array<Prisma.UtilisateurRecordUncheckedCreateInput>) {
  await prisma.$transaction(async (prisma) => {
    await prisma.utilisateurRecord.createMany({
      data: utilisateursRecord,
      // Il peut y avoir des e-mails en commun
      skipDuplicates: true,
    })
  })
}

function decodeJwt(token: string): Token {
  return JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) as Token
}

type UtilisateurCoNumRecord = Readonly<{
  createdAt: Date
  departement: string
  lastLogin: Date
  name: string
  mailSentDate: Date
  nom: string
  prenom: string
  region: string
  roles: Array<string>
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
}>

type Token = Readonly<{
  sub: string
}>
