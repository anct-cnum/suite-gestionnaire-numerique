// Stryker disable all
import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'

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
    ...override,
  }
}

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
    data: regionRecordFactory({
      ...override,
    }),
  })
}

export async function creerUnDepartement(
  override?: Partial<Prisma.DepartementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.departementRecord.create({
    data: departementRecordFactory({
      ...override,
    }),
  })
}

export async function creerUneStructure(
  override?: Partial<Prisma.StructureRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.structureRecord.create({
    data: structureRecordFactory({
      ...override,
    }),
  })
}

export async function creerUnGroupement(
  override?: Partial<Prisma.GroupementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.groupementRecord.create({
    data: groupementRecordFactory({
      ...override,
    }),
  })
}

export async function creerUnUtilisateur(
  override?: Partial<Prisma.UtilisateurRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.utilisateurRecord.create({
    data: utilisateurRecordFactory({
      ...override,
    }),
  })
}

export async function creerUneGouvernance(
  override?: Partial<Prisma.GouvernanceRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.gouvernanceRecord.create({
    data: gouvernanceRecordFactory({
      ...override,
    }),
  })
}

export async function creerUnComite(
  override?: Partial<Prisma.ComiteRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.comiteRecord.create({
    data: comiteRecordFactory({
      ...override,
    }),
  })
}

export async function creerUneFeuilleDeRoute(
  override?: Partial<Prisma.FeuilleDeRouteRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.feuilleDeRouteRecord.create({
    data: feuilleDeRouteRecordFactory({
      creation: epochTime,
      gouvernanceDepartementCode: '69',
      nom: 'Feuille de route inclusion',
      ...override,
    }),
  })
}

export async function creerUnMembre(override?: Partial<Prisma.MembreRecordUncheckedCreateInput>): Promise<void> {
  await prisma.membreRecord.create({
    data: {
      gouvernanceDepartementCode: '69',
      id: 'prefecture-69',
      type: 'Préfecture départementale',
      ...override,
    },
  })
}

export async function creerUnMembreStructure(
  override?: Partial<Prisma.MembreGouvernanceStructureRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceStructureRecord.create({
    data: {
      membreId: 'structure-79201467200028-69',
      role: 'observateur',
      structure: 'Pimms Médiation Grand Poitiers',
      ...override,
    },
  })
}

export async function creerUnMembreCommune(
  override?: Partial<Prisma.MembreGouvernanceCommuneRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceCommuneRecord.create({
    data: {
      commune: 'Mornant',
      membreId: 'commune-69141-69',
      role: 'observateur',
      ...override,
    },
  })
}

export async function creerUnMembreEpci(
  override?: Partial<Prisma.MembreGouvernanceEpciRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceEpciRecord.create({
    data: {
      epci: 'Métropole de Lyon',
      membreId: 'epci-200046977-69',
      role: 'observateur',
      ...override,
    },
  })
}

export async function creerUnMembreDepartement(
  override?: Partial<Prisma.MembreGouvernanceDepartementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceDepartementRecord.create({
    data: {
      departementCode: '69',
      membreId: 'departement-69-69',
      role: 'observateur',
      ...override,
    },
  })
}

export async function creerUnMembreSgar(
  override?: Partial<Prisma.MembreGouvernanceSgarRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceSgarRecord.create({
    data: {
      membreId: 'region-84-69',
      role: 'observateur',
      sgarCode: '84',
      ...override,
    },
  })
}
