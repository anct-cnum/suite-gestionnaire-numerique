/* eslint-disable camelcase */
// Stryker disable all
import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'

export function utilisateurRecordFactory(
  override?: Partial<Prisma.UtilisateurRecordUncheckedCreateInput>
): Prisma.UtilisateurRecordUncheckedCreateInput {
  return {
    dateDeCreation: epochTime,
    derniereConnexion: epochTime,
    emailDeContact: 'martin.tartempion@example.net',
    inviteLe: epochTime,
    isSuperAdmin: false,
    isSupprime: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'gestionnaire_structure',
    ssoEmail: 'martin.tartempion@example.net',
    ssoId: 'userFooId',
    telephone: '0102030405',
    ...override,
  }
}

export function gouvernanceRecordFactory(
  override?: Partial<Prisma.GouvernanceRecordUncheckedCreateInput>
): Prisma.GouvernanceRecordUncheckedCreateInput {
  return {
    departementCode: '75',
    derniereEditionNoteDeContexte: null,
    editeurNoteDeContexteId: null,
    editeurNotePriveeId: null,
    noteDeContexte: null,
    // @ts-expect-error
    notePrivee: null,
    ...override,
  }
}

export function comiteRecordFactory(
  override?: Partial<Prisma.ComiteRecordUncheckedCreateInput>
): Prisma.ComiteRecordUncheckedCreateInput {
  return {
    commentaire: 'un commentaire',
    creation: epochTime,
    date: epochTime,
    derniereEdition: epochTime,
    editeurUtilisateurId: '1',
    frequence: 'annuelle',
    gouvernanceDepartementCode: '11',
    type: 'strategique',
    ...override,
  }
}

export async function creerUneRegion(
  override?: Partial<Prisma.RegionRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.regionRecord.create({
    data: regionRecordFactory(override),
  })
}

export async function creerUnDepartement(
  override?: Partial<Prisma.DepartementRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.departementRecord.create({
    data: departementRecordFactory(override),
  })
}

export async function creerUneStructure(
  override?: {
    adresse?: string
    codePostal?: string
    commune?: string
    departementCode?: string
    identifiantEtablissement?: string
    type?: string
  } & Partial<Prisma.main_structureUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  const { adresse,
    codePostal,
    commune,
    contact,
    departementCode,
    id,
    identifiantEtablissement,
    type,
    ...rest
  } = override ?? {}

  // Valeurs par défaut de l'ancien structureRecordFactory
  const defaults = {
    adresse: '3 BIS AVENUE CHARLES DE GAULLE',
    codePostal: '84200',
    commune: 'PARIS',
    contact: {
      email: 'manon.verminac@example.com',
      fonction: 'Chargée de mission',
      nom: 'Verninac',
      prenom: 'Manon',
      telephone: '0102030405',
    },
    id: 10,
    identifiantEtablissement: '41816609600069',
    nom: 'Solidarnum',
    type: 'COMMUNE',
  }

  // Mapper les anciens champs vers main.structure
  const siret = identifiantEtablissement ?? defaults.identifiantEtablissement

  // Construire le contact JSON et l'adresse
  const contactData = contact ?? defaults.contact
  const adresseComplete = adresse ?? defaults.adresse
  const cp = codePostal ?? defaults.codePostal
  const ville = commune ?? defaults.commune

  // Créer l'adresse si nécessaire (pour le moment, on met juste les infos dans contact)
  const finalContact = {
    ...contactData,
    adresse: adresseComplete,
    codePostal: cp,
    commune: ville,
  }

  // Mapper type vers typologies (array)
  const typologies = type === undefined ? [defaults.type] : [type]

  // Créer une adresse si departementCode est fourni
  let adresse_id: null | number | undefined = rest.adresse_id
  if (departementCode !== undefined && departementCode !== '' && adresse_id === undefined) {
    // Construire un code_insee valide au format [code_dept][code_commune]
    // Le département généré sera les 2 premiers caractères du code_insee (ou 3 pour les DOM-TOM 97x/98x)
    const codeCommune = '001'
    const code_insee = departementCode + codeCommune

    // Rendre l'adresse unique en ajoutant le departementCode au nom_voie
    // pour éviter les conflits de contrainte d'unicité entre différents départements
    const nom_voie_unique = `${adresseComplete} - Dept ${departementCode}`

    // Chercher si l'adresse existe déjà pour éviter les doublons
    // La contrainte d'unicité est sur: (code_postal, nom_commune, nom_voie, numero_voie, repetition)
    let adresse = await client.adresse.findFirst({
      where: {
        code_insee,
        code_postal: cp,
        nom_commune: ville,
        nom_voie: nom_voie_unique,
      },
    })

    if (!adresse) {
      adresse = await client.adresse.create({
        data: {
          code_insee,
          code_postal: cp,
          nom_commune: ville,
          nom_voie: nom_voie_unique,
        },
      })
    }

    adresse_id = adresse.id
  }

  await client.main_structure.create({
    data: {
      contact: finalContact,
      id: id ?? defaults.id,
      nom: rest.nom ?? defaults.nom,
      siret,
      typologies,
      ...rest,
      adresse_id,
    },
  })
}

export async function creerUnGroupement(
  override?: Partial<Prisma.GroupementRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.groupementRecord.create({
    data: groupementRecordFactory(override),
  })
}

export async function creerUnUtilisateur(
  override?: Partial<Prisma.UtilisateurRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.utilisateurRecord.create({
    data: utilisateurRecordFactory(override),
  })
}

export async function creerUneGouvernance(
  override?: Partial<Prisma.GouvernanceRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.gouvernanceRecord.create({
    data: gouvernanceRecordFactory(override),
  })
}

export async function creerUnComite(
  override?: Partial<Prisma.ComiteRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.comiteRecord.create({
    data: comiteRecordFactory(override),
  })
}

export async function creerUneFeuilleDeRoute(
  override?: Partial<Prisma.FeuilleDeRouteRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.feuilleDeRouteRecord.create({
    data: feuilleDeRouteRecordFactory(override),
  })
}

export async function creerUneAction(
  override?: Partial<Prisma.ActionRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.actionRecord.create({
    data: actionRecordFactory(override),
  })
}

export async function creerUneDemandeDeSubvention(
  override?: Partial<Prisma.DemandeDeSubventionRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.demandeDeSubventionRecord.create({
    data: demandeDeSubventionRecordFactory(override),
  })
}

export async function creerUnBeneficiaireSubvention(
  override?: Partial<Prisma.BeneficiaireSubventionRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.beneficiaireSubventionRecord.create({
    data: beneficiaireSubventionRecordFactory(override),
  })
}

let autoStructureIdCounter = 1000

export async function creerUnMembre(
  override?: Partial<Prisma.MembreRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma

  // Si aucun structureId n'est fourni, créer automatiquement une structure
  if (override?.structureId === undefined) {
    const structureId = autoStructureIdCounter++
    const siret = `${structureId}`.padStart(14, '0')

    await creerUneStructure({
      departementCode: override?.gouvernanceDepartementCode ?? '69',
      id: structureId,
      nom: 'Structure auto-générée',
      siret,
    }, tx)

    await client.membreRecord.create({
      data: membreRecordFactory({ ...override, structureId }),
    })
  } else {
    await client.membreRecord.create({
      data: membreRecordFactory(override),
    })
  }
}

export async function creerUnContact(
  override?: Partial<Prisma.ContactMembreGouvernanceRecordUncheckedCreateInput>,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx ?? prisma
  await client.contactMembreGouvernanceRecord.create({
    data: contactRecordFactory(override),
  })
}

export async function creerMembres(gouvernanceDepartementCode: string): Promise<void> {
  await creerUnContact({
    email: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    fonction: 'Directeur',
    nom: 'Tartempion',
    prenom: 'Michel',
  })

  // Helper pour créer structure + membre avec un nom spécifique
  const creerMembreAvecNom = async (
    id: string,
    nom: string,
    type: string,
    isCoporteur = false
  ): Promise<void> => {
    const structureId = autoStructureIdCounter++
    const siret = `${structureId}`.padStart(14, '0')
    await creerUneStructure({ departementCode: gouvernanceDepartementCode, id: structureId, nom, siret })
    await prisma.membreRecord.create({
      data: membreRecordFactory({
        contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
        gouvernanceDepartementCode,
        id,
        isCoporteur,
        structureId,
        type,
      }),
    })
  }

  // Helper pour créer structure + candidat avec un nom spécifique
  const creerCandidatAvecNom = async (
    id: string,
    nom: string,
    type: string
  ): Promise<void> => {
    const structureId = autoStructureIdCounter++
    const siret = `${structureId}`.padStart(14, '0')
    await creerUneStructure({ departementCode: gouvernanceDepartementCode, id: structureId, nom, siret })
    await prisma.membreRecord.create({
      data: membreRecordFactory({
        contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
        gouvernanceDepartementCode,
        id,
        statut: 'candidat',
        structureId,
        type,
      }),
    })
  }

  await creerMembreAvecNom(`commune-blabla-${gouvernanceDepartementCode}`, 'Trévérien', 'Commune', true)
  await creerMembreAvecNom(`commune-94028-${gouvernanceDepartementCode}`, 'Créteil', 'Collectivité, commune', true)
  await creerMembreAvecNom(`epci-241927201-${gouvernanceDepartementCode}`, 'CA Tulle Agglo', 'Collectivité, EPCI')
  await creerMembreAvecNom(`epci-200072056-${gouvernanceDepartementCode}`, 'CC Porte du Jura', 'Collectivité, EPCI', true)
  await creerMembreAvecNom(`structure-38012986643097-${gouvernanceDepartementCode}`, 'Orange', 'Entreprise privée', true)
  await creerMembreAvecNom(`prefecture-${gouvernanceDepartementCode}`, 'Rhône', 'Préfecture départementale', true)
  await creerMembreAvecNom(`departement-69-${gouvernanceDepartementCode}`, 'Rhône', 'Conseil départemental')
  await creerMembreAvecNom(`region-53-${gouvernanceDepartementCode}`, 'Bretagne', 'Préfecture régionale', true)
  await creerMembreAvecNom(`region-11-${gouvernanceDepartementCode}`, 'Île-de-France', 'Préfecture régionale')
  await creerCandidatAvecNom(`commune-110-${gouvernanceDepartementCode}`, 'Pipriac', 'Préfecture régionale')
  await creerCandidatAvecNom(`commune-112-${gouvernanceDepartementCode}`, 'Rennes', 'Préfecture régionale')
  await creerMembreAvecNom(`commune-111-${gouvernanceDepartementCode}`, 'Rennes', 'Préfecture régionale')
  await creerMembreAvecNom(`commune-113-${gouvernanceDepartementCode}`, 'Pipriac', 'Préfecture régionale', false)
}

export async function creerUneEnveloppeFinancement(
  override?: Partial<Prisma.EnveloppeFinancementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.enveloppeFinancementRecord.create({
    data: enveloppeFinancementRecordFactory(override),
  })
}

export async function creerUnCoFinancement(
  override?: Partial<Prisma.CoFinancementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.coFinancementRecord.create({
    data: coFinancementRecordFactory(override),
  })
}

export async function creerUnPorteurAction(
  override?: Partial<Prisma.PorteurActionRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.porteurActionRecord.create({
    data: porteurActionRecordFactory(override),
  })
}

export function feuilleDeRouteRecordFactory(
  override?: Partial<Prisma.FeuilleDeRouteRecordUncheckedCreateInput>
): Prisma.FeuilleDeRouteRecordUncheckedCreateInput {
  return {
    creation: epochTime,
    derniereEdition: epochTime,
    gouvernanceDepartementCode: '69',
    nom: 'Feuille de route 69',
    oldUUID: null,
    perimetreGeographique:'departemental',
    pieceJointe: null,
    porteurId: null,
    ...override,
  }
}

export function actionRecordFactory(
  override?: Partial<Prisma.ActionRecordUncheckedCreateInput>
): Prisma.ActionRecordUncheckedCreateInput {
  return {
    besoins: [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL, BesoinsPossible.STRUCTURER_UN_FONDS],
    budgetGlobal: 0,
    contexte: "Contexte de l'action",
    createurId: 1,
    creation: epochTime,
    dateDeDebut: epochTime,
    dateDeFin: epochTimePlusOneDay,
    derniereModification: epochTime,
    description: "Description détaillée de l'action",
    feuilleDeRouteId: 1,
    nom: 'Action test',
    ...override,
  }
}

function regionRecordFactory(
  override?: Partial<Prisma.RegionRecordUncheckedCreateInput>
): Prisma.RegionRecordUncheckedCreateInput {
  return {
    code: '11',
    nom: 'Île-de-France',
    ...override,
  }
}

function departementRecordFactory(
  override?: Partial<Prisma.DepartementRecordUncheckedCreateInput>
): Prisma.DepartementRecordUncheckedCreateInput {
  return {
    code: '75',
    nom: 'Paris',
    regionCode: '11',
    ...override,
  }
}

function groupementRecordFactory(
  override?: Partial<Prisma.GroupementRecordUncheckedCreateInput>
): Prisma.GroupementRecordUncheckedCreateInput {
  return {
    id: 10,
    nom: 'Hubikoop',
    ...override,
  }
}

function demandeDeSubventionRecordFactory(
  override?: Partial<Prisma.DemandeDeSubventionRecordUncheckedCreateInput>
): Prisma.DemandeDeSubventionRecordUncheckedCreateInput {
  return {
    actionId: 1,
    createurId: 1,
    creation: epochTime,
    derniereModification: epochTime,
    enveloppeFinancementId: 1,
    statut: 'deposee',
    subventionDemandee: 0,
    subventionEtp: undefined,
    subventionPrestation: undefined,
    ...override,
  }
}

function enveloppeFinancementRecordFactory(
  override?: Partial<Prisma.EnveloppeFinancementRecordUncheckedCreateInput>
): Prisma.EnveloppeFinancementRecordUncheckedCreateInput {
  return {
    dateDeDebut: epochTime,
    dateDeFin: epochTimePlusOneDay,
    libelle: 'Enveloppe test',
    montant: 0,
    ...override,
  }
}

function beneficiaireSubventionRecordFactory(
  override?: Partial<Prisma.BeneficiaireSubventionRecordUncheckedCreateInput>
): Prisma.BeneficiaireSubventionRecordUncheckedCreateInput {
  return {
    demandeDeSubventionId: 1,
    membreId: 'defaultMembreId',
    ...override,
  }
}

function membreRecordFactory(
  override?: Partial<Prisma.MembreRecordUncheckedCreateInput>
): Prisma.MembreRecordUncheckedCreateInput {
  return {
    contact: 'email@example.com',
    gouvernanceDepartementCode: '69',
    id: 'prefecture-69',
    isCoporteur: false,
    oldUUID: '30CA3FA5-76B8-471D-A811-D96074B18EB1',
    statut: 'confirme',
    structureId: 10,
    type: 'Préfecture départementale',
    ...override,
  }
}

function contactRecordFactory(
  override?: Partial<Prisma.ContactMembreGouvernanceRecordUncheckedCreateInput>
): Prisma.ContactMembreGouvernanceRecordUncheckedCreateInput {
  return {
    email: 'email@example.com',
    fonction: 'Directeur',
    nom: 'Tartempion',
    prenom: 'Michel',
    ...override,
  }
}

async function creerUnCandidat(override?: Partial<Prisma.MembreRecordUncheckedCreateInput>): Promise<void> {
  // Si aucun structureId n'est fourni, créer automatiquement une structure
  if (override?.structureId === undefined) {
    const structureId = autoStructureIdCounter++
    const siret = `${structureId}`.padStart(14, '0')

    await creerUneStructure({
      departementCode: override?.gouvernanceDepartementCode ?? '69',
      id: structureId,
      nom: 'Structure auto-générée',
      siret,
    })

    await prisma.membreRecord.create({
      data: membreRecordFactory({
        statut: 'candidat',
        ...override,
        structureId,
      }),
    })
  } else {
    await prisma.membreRecord.create({
      data: membreRecordFactory({
        statut: 'candidat',
        ...override,
      }),
    })
  }
}

// async function creerUnSuggere(override?: Partial<Prisma.MembreRecordUncheckedCreateInput>): Promise<void> {
//   await prisma.membreRecord.create({
//     data: membreRecordFactory({
//       statut: 'suggere',
//       ...override,
//     }),
//   })
// }

function coFinancementRecordFactory(
  override?: Partial<Prisma.CoFinancementRecordUncheckedCreateInput>
): Prisma.CoFinancementRecordUncheckedCreateInput {
  return {
    actionId: 1,
    memberId: 'membre1',
    montant: 0,
    ...override,
  }
}

function porteurActionRecordFactory(
  override?: Partial<Prisma.PorteurActionRecordUncheckedCreateInput>
): Prisma.PorteurActionRecordUncheckedCreateInput {
  return {
    actionId: 1,
    membreId: 'membre1',
    ...override,
  }
}
