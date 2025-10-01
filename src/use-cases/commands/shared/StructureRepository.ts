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
  categorieJuridique?: string
  categorieJuridiqueLibelle: string
  codePostal: string
  commune: string
  departementCode: string
  identifiantEtablissement: string
  nom: string
}>

export interface StructureRepository
  extends CreateStructureRepository,
  GetStructureBySiretRepository {}