// Stryker disable all
import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'

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
    role: 'instructeur',
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
  override?: Partial<Prisma.RegionRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.regionRecord.create({
    data: regionRecordFactory(override),
  })
}

export async function creerUnDepartement(
  override?: Partial<Prisma.DepartementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.departementRecord.create({
    data: departementRecordFactory(override),
  })
}

export async function creerUneStructure(
  override?: Partial<Prisma.StructureRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.structureRecord.create({
    data: structureRecordFactory(override),
  })
}

export async function creerUnGroupement(
  override?: Partial<Prisma.GroupementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.groupementRecord.create({
    data: groupementRecordFactory(override),
  })
}

export async function creerUnUtilisateur(
  override?: Partial<Prisma.UtilisateurRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.utilisateurRecord.create({
    data: utilisateurRecordFactory(override),
  })
}

export async function creerUneGouvernance(
  override?: Partial<Prisma.GouvernanceRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.gouvernanceRecord.create({
    data: gouvernanceRecordFactory(override),
  })
}

export async function creerUnComite(
  override?: Partial<Prisma.ComiteRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.comiteRecord.create({
    data: comiteRecordFactory(override),
  })
}

export async function creerUneFeuilleDeRoute(
  override?: Partial<Prisma.FeuilleDeRouteRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.feuilleDeRouteRecord.create({
    data: feuilleDeRouteRecordFactory(override),
  })
}

export async function creerUneAction(
  override?: Partial<Prisma.ActionRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.actionRecord.create({
    data: actionRecordFactory(override),
  })
}

export async function creerUneDemandeDeSubvention(
  override?: Partial<Prisma.DemandeDeSubventionRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.demandeDeSubventionRecord.create({
    data: demandeDeSubventionRecordFactory(override),
  })
}

export async function creerUnBeneficiaireSubvention(
  override?: Partial<Prisma.BeneficiaireSubventionRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.beneficiaireSubventionRecord.create({
    data: beneficiaireSubventionRecordFactory(override),
  })
}

export async function creerUnMembre(override?: Partial<Prisma.MembreRecordUncheckedCreateInput>): Promise<void> {
  await prisma.membreRecord.create({
    data: membreRecordFactory(override),
  })
}

export async function creerUnMembreDepartement(
  override?: Partial<Prisma.MembreGouvernanceDepartementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceDepartementRecord.create({
    data: membreDepartementRecordFactory(override),
  })
}

export async function creerUnMembreStructure(
  override?: Partial<Prisma.MembreGouvernanceStructureRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceStructureRecord.create({
    data: membreStructureRecordFactory(override),
  })
}

export async function creerUnMembreCommune(
  override?: Partial<Prisma.MembreGouvernanceCommuneRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceCommuneRecord.create({
    data: membreCommuneRecordFactory(override),
  })
}

export async function creerUnMembreEpci(
  override?: Partial<Prisma.MembreGouvernanceEpciRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceEpciRecord.create({
    data: membreEpciRecordFactory(override),
  })
}

export async function creerUnMembreSgar(
  override?: Partial<Prisma.MembreGouvernanceSgarRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceSgarRecord.create({
    data: membreSgarRecordFactory(override),
  })
}

export async function creerUnContact(
  override?: Partial<Prisma.ContactMembreGouvernanceRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.contactMembreGouvernanceRecord.create({
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
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `commune-35345-${gouvernanceDepartementCode}`,
    type: undefined,
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `commune-94028-${gouvernanceDepartementCode}`,
    type: 'Collectivité, commune',
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `epci-241927201-${gouvernanceDepartementCode}`,
    type: 'Collectivité, EPCI',
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `epci-200072056-${gouvernanceDepartementCode}`,
    type: 'Collectivité, EPCI',
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `structure-38012986643097-${gouvernanceDepartementCode}`,
    type: 'Entreprise privée',
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `prefecture-${gouvernanceDepartementCode}`,
    type: 'Préfecture départementale',
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `departement-69-${gouvernanceDepartementCode}`,
    type: 'Conseil départemental',
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `region-53-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnMembre({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `region-11-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnCandidat({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `commune-110-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnCandidat({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `commune-112-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnSuggere({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `commune-111-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnSuggere({
    contact: `commune-35345-${gouvernanceDepartementCode}@example.com`,
    gouvernanceDepartementCode,
    id: `commune-113-${gouvernanceDepartementCode}`,
    type: 'Préfecture régionale',
  })
  await creerUnMembreCommune({
    commune: 'Trévérien',
    membreId: `commune-35345-${gouvernanceDepartementCode}`,
    role: 'recipiendaire',
  })
  await creerUnMembreCommune({
    commune: 'Trévérien',
    membreId: `commune-35345-${gouvernanceDepartementCode}`,
    role: 'beneficiaire',
  })
  await creerUnMembreCommune({
    commune: 'Trévérien',
    membreId: `commune-35345-${gouvernanceDepartementCode}`,
    role: 'coporteur',
  })
  await creerUnMembreCommune({
    commune: 'Créteil',
    membreId: `commune-94028-${gouvernanceDepartementCode}`,
    role: 'coporteur',
  })
  await creerUnMembreDepartement({
    departementCode: gouvernanceDepartementCode,
    membreId: `departement-69-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
  await creerUnMembreDepartement({
    departementCode: gouvernanceDepartementCode,
    membreId: `prefecture-${gouvernanceDepartementCode}`,
    role: 'coporteur',
  })
  await creerUnMembreEpci({
    epci: 'CA Tulle Agglo',
    membreId: `epci-241927201-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
  await creerUnMembreEpci({
    epci: 'CC Porte du Jura',
    membreId: `epci-200072056-${gouvernanceDepartementCode}`,
    role: 'coporteur',
  })
  await creerUnMembreEpci({
    epci: 'CC Porte du Jura',
    membreId: `epci-200072056-${gouvernanceDepartementCode}`,
    role: 'beneficiaire',
  })
  await creerUnMembreSgar({
    membreId: `region-11-${gouvernanceDepartementCode}`,
    role: 'observateur',
    sgarCode: '11',
  })
  await creerUnMembreSgar({
    membreId: `region-53-${gouvernanceDepartementCode}`,
    role: 'coporteur',
    sgarCode: '53',
  })
  await creerUnMembreStructure({
    membreId: `structure-38012986643097-${gouvernanceDepartementCode}`,
    role: 'recipiendaire',
    structure: 'Orange',
  })
  await creerUnMembreStructure({
    membreId: `structure-38012986643097-${gouvernanceDepartementCode}`,
    role: 'coporteur',
    structure: 'Orange',
  })
  await creerUnMembreCommune({
    commune: 'Pipriac',
    membreId: `commune-110-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
  await creerUnMembreCommune({
    commune: 'Rennes',
    membreId: `commune-111-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
  await creerUnMembreCommune({
    commune: 'Rennes',
    membreId: `commune-112-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
  await creerUnMembreCommune({
    commune: 'Pipriac',
    membreId: `commune-113-${gouvernanceDepartementCode}`,
    role: 'observateur',
  })
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

function structureRecordFactory(
  override?: Partial<Prisma.StructureRecordUncheckedCreateInput>
): Prisma.StructureRecordUncheckedCreateInput {
  return {
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
    departementCode: '75',
    id: 10,
    idMongo: '123456',
    identifiantEtablissement: '41816609600069',
    nom: 'Solidarnum',
    statut: 'VALIDATION_COSELEC',
    type: 'COMMUNE',
    ...override,
  }
}

function feuilleDeRouteRecordFactory(
  override?: Partial<Prisma.FeuilleDeRouteRecordUncheckedCreateInput>
): Prisma.FeuilleDeRouteRecordUncheckedCreateInput {
  return {
    creation: epochTime,
    gouvernanceDepartementCode: '69',
    nom: 'Feuille de route inclusion',
    oldUUID: 'D5BA203C-6DAA-4B30-B7F5-6E5B9DF97F9C',
    pieceJointe: undefined,
    porteurId: undefined,
    ...override,
  }
}

function actionRecordFactory(
  override?: Partial<Prisma.ActionRecordUncheckedCreateInput>
): Prisma.ActionRecordUncheckedCreateInput {
  return {
    besoins: ['besoin 1', 'besoin 2'],
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

export async function creerUneEnveloppeFinancement(
  override?: Partial<Prisma.EnveloppeFinancementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.enveloppeFinancementRecord.create({
    data: enveloppeFinancementRecordFactory(override),
  })
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
    oldUUID: '30CA3FA5-76B8-471D-A811-D96074B18EB1',
    statut: 'confirme',
    type: 'Préfecture départementale',
    ...override,
  }
}

function membreStructureRecordFactory(
  override?: Partial<Prisma.MembreGouvernanceStructureRecordUncheckedCreateInput>
): Prisma.MembreGouvernanceStructureRecordUncheckedCreateInput {
  return {
    membreId: 'structure-79201467200028-69',
    role: 'observateur',
    structure: 'Pimms Médiation Grand Poitiers',
    ...override,
  }
}

function membreCommuneRecordFactory(
  override?: Partial<Prisma.MembreGouvernanceCommuneRecordUncheckedCreateInput>
): Prisma.MembreGouvernanceCommuneRecordUncheckedCreateInput {
  return {
    commune: 'Mornant',
    membreId: 'commune-69141-69',
    role: 'observateur',
    ...override,
  }
}

function membreEpciRecordFactory(
  override?: Partial<Prisma.MembreGouvernanceEpciRecordUncheckedCreateInput>
): Prisma.MembreGouvernanceEpciRecordUncheckedCreateInput {
  return {
    epci: 'Métropole de Lyon',
    membreId: 'epci-200046977-69',
    role: 'observateur',
    ...override,
  }
}

function membreDepartementRecordFactory(
  override?: Partial<Prisma.MembreGouvernanceDepartementRecordUncheckedCreateInput>
): Prisma.MembreGouvernanceDepartementRecordUncheckedCreateInput {
  return {
    departementCode: '69',
    membreId: 'departement-69-69',
    role: 'observateur',
    ...override,
  }
}

function membreSgarRecordFactory(
  override?: Partial<Prisma.MembreGouvernanceSgarRecordUncheckedCreateInput>
): Prisma.MembreGouvernanceSgarRecordUncheckedCreateInput {
  return {
    membreId: 'region-84-69',
    role: 'observateur',
    sgarCode: '84',
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
  await prisma.membreRecord.create({
    data: membreRecordFactory({
      statut: 'candidat',
      ...override,
    }),
  })
}

async function creerUnSuggere(override?: Partial<Prisma.MembreRecordUncheckedCreateInput>): Promise<void> {
  await prisma.membreRecord.create({
    data: membreRecordFactory({
      statut: 'suggere',
      ...override,
    }),
  })
}

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

export async function creerUnCoFinancement(
  override?: Partial<Prisma.CoFinancementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.coFinancementRecord.create({
    data: coFinancementRecordFactory(override),
  })
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

export async function creerUnPorteurAction(
  override?: Partial<Prisma.PorteurActionRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.porteurActionRecord.create({
    data: porteurActionRecordFactory(override),
  })
}
