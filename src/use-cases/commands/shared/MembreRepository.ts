import { Membre, MembreState } from '@/domain/Membre'

export interface GetMembreRepository {
  get(uid: MembreState['uid']['value']): Promise<Membre>
}

export interface UpdateMembreRepository {
  update(membre: Membre): Promise<void>
}

export interface CreateMembreRepository {
  create(
    membre: Membre, 
    contactData?: ContactData, 
    contactTechniqueData?: ContactData, 
    entrepriseData?: EntrepriseData
  ): Promise<void>
}

export type ContactData = Readonly<{
  email: string
  fonction: string
  nom: string
  prenom: string
}>

export type EntrepriseData = Readonly<{
  categorieJuridiqueUniteLegale: string
}>

export interface MembreRepository
  extends CreateMembreRepository,
  GetMembreRepository,
  UpdateMembreRepository {}
