import { Prisma } from '@prisma/client'

import { Structure } from '@/domain/Structure'

export interface GetStructureBySiretRepository {
  getBySiret(siret: string, tx?: Prisma.TransactionClient): Promise<null | Structure>
}

export interface CreateStructureRepository {
  create(structure: StructureData, tx?: Prisma.TransactionClient): Promise<Structure>
}

export type StructureData = Readonly<{
  adresse: string
  adresseEnrichie?: AdresseEnrichie | null
  categorieJuridique?: string
  categorieJuridiqueLibelle: string
  codeInsee: string
  codePostal: string
  commune: string
  departementCode: string
  identifiantEtablissement: string
  nom: string
  nomVoie: string
  numeroVoie: string
}>

export interface ModifierNomStructureRepository {
  // null = structure introuvable.
  lireNomStructure(structureId: number): Promise<NomActuelStructure | null>
  // false = conflit d'unicité (siret, denomination_antenne).
  modifierNom(data: ModifierNomStructureData): Promise<boolean>
}

export type ModifierNomStructureData = Readonly<{
  // null = on efface l'override et on retombe sur le nom SIRENE.
  denominationAntenne: null | string
  structureId: number
}>

export type NomActuelStructure = Readonly<{
  // null = structure canonique (affiche le nom SIRENE).
  denominationAntenne: null | string
}>

export interface ModifierAdresseStructureRepository {
  // Re-pointe structure_administrative.adresse_id : on réutilise une adresse existante
  // (même clef_interop BAN) ou on en crée une nouvelle. On ne modifie JAMAIS une ligne adresse.
  rattacherAdresse(structureId: number, adresse: AdresseARattacher): Promise<void>
}

export type AdresseARattacher = Readonly<{
  clefInterop: string
  codeBan: null | string
  codeInsee: string
  codePostal: string
  latitude: number
  longitude: number
  nomCommune: string
  nomVoie: null | string
  numeroVoie: null | number
  repetition: null | string
}>

export interface StructureRepository
  extends CreateStructureRepository, GetStructureBySiretEmployeuseRepository, GetStructureBySiretRepository {}

interface GetStructureBySiretEmployeuseRepository {
  getBySiretEmployeuse(siret: string, tx?: Prisma.TransactionClient): Promise<null | Structure>
}

type AdresseEnrichie = Readonly<{
  banClefInterop: string
  banCodeBan: null | string
  banCodeInsee: string
  banCodePostal: string
  banLatitude: number
  banLongitude: number
  banNomCommune: string
  banNomVoie: string
  banNumeroVoie: null | number
  banRepetition: null | string
}>
