// Stryker disable all
import { Prisma } from '@prisma/client'

import prisma from '../../prisma/prismaClient'
import { epochTime } from '@/shared/testHelper'

export function regionRecordFactory(
  override?: Partial<Prisma.RegionRecordUncheckedCreateInput>
): Prisma.RegionRecordUncheckedCreateInput {
  return {
    code: '11',
    nom: 'Île-de-France',
    ...override,
  }
}

export function departementRecordFactory(
  override?: Partial<Prisma.DepartementRecordUncheckedCreateInput>
): Prisma.DepartementRecordUncheckedCreateInput {
  return {
    code: '75',
    nom: 'Paris',
    regionCode: '11',
    ...override,
  }
}

export function groupementRecordFactory(
  override?: Partial<Prisma.GroupementRecordUncheckedCreateInput>
): Prisma.GroupementRecordUncheckedCreateInput {
  return {
    id: 10,
    nom: 'Hubikoop',
    ...override,
  }
}

export function structureRecordFactory(
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
    editeurNotePriveeId: 'userFooId',
    notePrivee: {
      contenu: 'un contenu quelconque',
      derniereEdition: '1970-01-01T00:00:00.000Z',
    },
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

export function noteDeContexteRecordFactory(
  override?: Partial<Prisma.NoteDeContexteRecordUncheckedCreateInput>
): Prisma.NoteDeContexteRecordUncheckedCreateInput {
  return {
    contenu: '<p>contenu HTML</p>',
    derniereEdition: epochTime,
    editeurId: 'userFooId',
    gouvernanceDepartementCode: '11',
    ...override,
  }
}

export async function ajouterUneRegion(
  override?: Partial<Prisma.RegionRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.regionRecord.create({
    data: regionRecordFactory({
      code: '84',
      nom: 'Auvergne-Rhône-Alpes',
      ...override,
    }),
  })
}

export async function ajouterUnDepartement(
  override?: Partial<Prisma.DepartementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.departementRecord.create({
    data: departementRecordFactory({
      code: '69',
      nom: 'Rhône',
      regionCode: '84',
      ...override,
    }),
  })
}

export async function ajouterUneGouvernance(
  override?: Partial<Prisma.GouvernanceRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.gouvernanceRecord.create({
    data: {
      departementCode: '69',
      ...override,
    },
  })
}

export async function ajouterUnMembreStructure(
  override?: Partial<Prisma.MembreGouvernanceStructureRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceStructureRecord.create({
    data: {
      gouvernanceDepartementCode: '69',
      role: 'coporteur',
      structure: 'Préfecture du Rhône',
      ...override,
    },
  })
}

export async function ajouterUnMembreCommune(
  override?: Partial<Prisma.MembreGouvernanceCommuneRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceCommuneRecord.create({
    data: {
      commune: 'Mornant',
      gouvernanceDepartementCode: '69',
      role: 'cofinanceur',
      ...override,
    },
  })
}

export async function ajouterUnMembreEpci(
  override?: Partial<Prisma.MembreGouvernanceEpciRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceEpciRecord.create({
    data: {
      epci: 'Métropole de Lyon',
      gouvernanceDepartementCode: '69',
      role: 'recipiendaire',
      ...override,
    },
  })
}

export async function ajouterUnMembreDepartement(
  override?: Partial<Prisma.MembreGouvernanceDepartementRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceDepartementRecord.create({
    data: {
      departementCode: '69',
      gouvernanceDepartementCode: '69',
      role: 'cofinanceur',
      ...override,
    },
  })
}

export async function ajouterUnMembreSgar(
  override?: Partial<Prisma.MembreGouvernanceSgarRecordUncheckedCreateInput>
): Promise<void> {
  await prisma.membreGouvernanceSgarRecord.create({
    data: {
      gouvernanceDepartementCode: '69',
      role: 'recipiendaire',
      sgarCode: '84',
      ...override,
    },
  })
}
