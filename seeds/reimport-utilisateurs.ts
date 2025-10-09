/* eslint-disable no-console */
import { Prisma, Role } from '@prisma/client'

import { coNumClient } from './co-num/coNumClient'
import prisma from '../prisma/prismaClient'

// MODE DRY-RUN : passer à false pour exécuter réellement les modifications
const DRY_RUN = true
const greenColor = '\x1b[32m%s\x1b[0m'
const yellowColor = '\x1b[33m%s\x1b[0m'
const redColor = '\x1b[31m%s\x1b[0m'
const blueColor = '\x1b[36m%s\x1b[0m'
async function migration(): Promise<void> {


  if (DRY_RUN) {
    console.log(blueColor, '🔍 MODE DRY-RUN ACTIVÉ - Aucune modification ne sera appliquée\n')
  }

  console.log(greenColor, '=== Début du réimport des utilisateurs ===\n')

  // 1. Récupération des données sources
  console.log(greenColor, 'Étape 1/4 : Récupération des utilisateurs CoNum')
  const utilisateursCoNumRecord = await retrieveUtilisateursCoNum()
  console.log(greenColor, `  → ${utilisateursCoNumRecord.length} utilisateurs CoNum récupérés\n`)

  // 2. Transformation des données
  console.log(greenColor, 'Étape 2/4 : Transformation des données')
  const utilisateursFromSources = [
    ...await transformUtilisateursCoNumToUtilisateurs(utilisateursCoNumRecord),
    unUtilisateurDeTest(),
  ]
  console.log(greenColor, `  → ${utilisateursFromSources.length} utilisateurs transformés\n`)

  // 3. Récupération des utilisateurs existants dans PostgreSQL
  console.log(greenColor, 'Étape 3/4 : Récupération des utilisateurs existants en base')
  const utilisateursExistants = await prisma.utilisateurRecord.findMany({
    select: {
      id: true,
      ssoId: true,
      ssoEmail: true,
      emailDeContact: true,
      nom: true,
      prenom: true,
    },
  })
  console.log(greenColor, `  → ${utilisateursExistants.length} utilisateurs existants en base\n`)

  // 4. Comparaison et synchronisation
  console.log(greenColor, `Étape 4/4 : ${DRY_RUN ? 'Analyse' : 'Synchronisation'} des utilisateurs\n`)

  const stats = {
    created: 0,
    updated: 0,
    unchanged: 0,
  }

  for (const utilisateurSource of utilisateursFromSources) {
    // Recherche de l'utilisateur existant par ssoId ou ssoEmail
    const utilisateurExistant = utilisateursExistants.find(
      (u) => u.ssoId === utilisateurSource.ssoId || u.ssoEmail === utilisateurSource.ssoEmail
    )

    if (utilisateurExistant) {
      // Mise à jour de l'utilisateur existant
      if (DRY_RUN) {
        console.log(blueColor, `  [DRY] MAJ: ${utilisateurSource.emailDeContact} (${utilisateurSource.role})`)
        console.log(blueColor, `        ID existant: ${utilisateurExistant.id} | Ancien: ${utilisateurExistant.prenom} ${utilisateurExistant.nom}`)
      } else {
        await prisma.utilisateurRecord.update({
          data: utilisateurSource,
          where: { id: utilisateurExistant.id },
        })
        console.log(greenColor, `  ✓ MAJ: ${utilisateurSource.emailDeContact} (${utilisateurSource.role})`)
      }
      stats.updated++
    } else {
      // Création d'un nouvel utilisateur
      if (DRY_RUN) {
        console.log(blueColor, `  [DRY] NEW: ${utilisateurSource.emailDeContact} (${utilisateurSource.role})`)
        console.log(blueColor, `        Nom: ${utilisateurSource.prenom} ${utilisateurSource.nom} | Structure: ${utilisateurSource.structureId ?? 'N/A'}`)
      } else {
        try {
          await prisma.utilisateurRecord.create({
            data: utilisateurSource,
          })
          console.log(greenColor, `  ✓ NEW: ${utilisateurSource.emailDeContact} (${utilisateurSource.role})`)
          stats.created++
        } catch (error) {
          console.log(redColor, `  ✗ Erreur lors de la création de ${utilisateurSource.emailDeContact}: ${(error as Error).message}`)
        }
      }
      if (DRY_RUN) {
        stats.created++
      }
    }
  }

  // 5. Détection des utilisateurs manquants dans les sources
  console.log('\n' + yellowColor, '=== Utilisateurs présents en base mais absents des sources ===')

  const ssoIdsFromSources = new Set(utilisateursFromSources.map((u) => u.ssoId))
  const ssoEmailsFromSources = new Set(utilisateursFromSources.map((u) => u.ssoEmail))

  const utilisateursMissing = utilisateursExistants.filter(
    (u) => !ssoIdsFromSources.has(u.ssoId) && !ssoEmailsFromSources.has(u.ssoEmail)
  )

  if (utilisateursMissing.length > 0) {
    console.log(yellowColor, `⚠️  ${utilisateursMissing.length} utilisateur(s) non trouvé(s) dans les sources:\n`)
    for (const utilisateur of utilisateursMissing) {
      console.log(yellowColor, `  ⚠  ${utilisateur.emailDeContact} (${utilisateur.prenom} ${utilisateur.nom}) - ssoId: ${utilisateur.ssoId}`)
    }
  } else {
    console.log(greenColor, '  ✓ Tous les utilisateurs en base sont présents dans les sources')
  }

  // 6. Résumé
  console.log('\n' + greenColor, `=== Résumé de ${DRY_RUN ? 'l\'analyse' : 'la synchronisation'} ===`)
  console.log(greenColor, `  ${DRY_RUN ? 'Seraient créés' : 'Créés'}: ${stats.created}`)
  console.log(greenColor, `  ${DRY_RUN ? 'Seraient mis à jour' : 'Mis à jour'}: ${stats.updated}`)
  console.log(yellowColor, `  Manquants dans les sources: ${utilisateursMissing.length}`)
  console.log(greenColor, `  Total traités: ${utilisateursFromSources.length}`)

  if (DRY_RUN) {
    console.log('\n' + blueColor, '💡 Pour exécuter réellement les modifications, passez DRY_RUN à false dans le script')
  }

  console.log('\n' + greenColor, '=== Réimport terminé ===')
}

void migration()

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
  const { client, db } = await coNumClient()

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
            nom: { $ifNull: ['$nom', '~'] },
            // Le prénom n'est pas forcément renseigné
            prenom: { $ifNull: ['$prenom', '~'] },
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
    let role: Role
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

      if (structure) {
      structureId = structure.id
      }else{
        console.log(redColor, `  ✗ Structure non trouvée pour ${utilisateurCoNumRecord.entityId}`)
      }
    } else if (isGestionnaireRegion) {
      role = 'gestionnaire_region'

      regionCode = utilisateurCoNumRecord.region
    } else if (isGestionnaireDepartement) {
      role = 'gestionnaire_departement'

      departementCode = utilisateurCoNumRecord.departement
    } else {
      role = 'gestionnaire_structure'
    }

    return {
      dateDeCreation: utilisateurCoNumRecord.createdAt,
      departementCode,
      derniereConnexion: utilisateurCoNumRecord.lastLogin,
      emailDeContact: utilisateurCoNumRecord.name,
      groupementId,
      inviteLe: utilisateurCoNumRecord.mailSentDate,
      // isSuperAdmin: cette notion n'existe pas
      // isSupprime: cette notion n'existe pas
      nom: utilisateurCoNumRecord.nom,

      prenom: utilisateurCoNumRecord.prenom,
      regionCode,
      role,
      ssoEmail: utilisateurCoNumRecord.name,
      ssoId: utilisateurCoNumRecord.sub,
      structureId,
      telephone: '',
    }
  })
}

function unUtilisateurDeTest(): Prisma.UtilisateurRecordUncheckedCreateInput {
  const now = new Date()

  return {
    dateDeCreation: now,
    departementCode: 'zzz',
    derniereConnexion: now,
    emailDeContact: 'compte.de.test@example.com',
    groupementId: 10_000_000,
    inviteLe: now,
    isSuperAdmin: true,
    isSupprime: false,
    nom: 'Test',
    prenom: 'CompteDe',
    regionCode: 'zz',
    role: 'administrateur_dispositif',
    ssoEmail: 'compte.de.test@example.com',
    ssoId: 'e7a41249-942d-46b7-b362-5f00d3166ea1',
    structureId: 10_000_000,
    telephone: '0102030405',
  }
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
  mailSentDate: Date
  name: string
  nom: string
  prenom: string
  region: string
  reseau: string
  roles: Array<string>
  sub: string
}>
