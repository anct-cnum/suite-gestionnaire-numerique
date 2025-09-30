import { Prisma } from '@prisma/client'

import { Membre, MembreState } from '@/domain/Membre'

export interface GetMembreRepository {
  get(uid: MembreState['uid']['value'], tx?: Prisma.TransactionClient): Promise<Membre>
}

export interface UpdateMembreRepository {
  update(membre: Membre, tx?: Prisma.TransactionClient): Promise<void>
}

export interface CreateMembreRepository {
  create(
    membre: Membre,
    entrepriseData: EntrepriseData,
    contactData?: ContactData,
    contactTechniqueData?: ContactData,
    tx?: Prisma.TransactionClient
  ): Promise<void>
}

export type ContactData = Readonly<{
  email: string
  fonction: string
  nom: string
  prenom: string
}>

export type EntrepriseData = Readonly<{
  categorieJuridiqueCode: string
  categorieJuridiqueUniteLegale: string
  siret: string
}>

export interface MembreRepository
  extends CreateMembreRepository,
  GetMembreRepository,
  UpdateMembreRepository {}
