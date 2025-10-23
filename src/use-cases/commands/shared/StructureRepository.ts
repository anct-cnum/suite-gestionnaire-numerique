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

export interface StructureRepository
  extends CreateStructureRepository,
  GetStructureBySiretEmployeuseRepository,
  GetStructureBySiretRepository {}

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