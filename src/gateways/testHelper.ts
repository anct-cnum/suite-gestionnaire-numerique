import { Prisma } from '@prisma/client'

import { Profile } from './ProConnectAuthentificationGateway'

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
    email: 'martin.tartempion@example.net',
    inviteLe: epochTime,
    isSuperAdmin: false,
    isSupprime: false,
    nom: 'Tartempion',
    prenom: 'Martin',
    role: 'instructeur',
    ssoId: '8e39c6db-2f2a-45cf-ba65-e2831241cbe4',
    telephone: '0102030405',
    ...override,
  }
}

export function ssoProfileFactory(override?: Partial<Profile>): { user: Profile } {
  return {
    user: {
      aud: '',
      email: '',
      exp: 0,
      given_name: '',
      iat: 0,
      id: '',
      idp_id: '',
      iss: '',
      phone_number: '',
      siret: '',
      sub: '',
      usual_name: '',
      ...override,
    },
  }
}

export const epochTime = new Date(0)