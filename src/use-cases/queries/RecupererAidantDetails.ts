export interface AidantDetailsLoader {
  findById(id: string): Promise<AidantDetailsErrorReadModel | AidantDetailsReadModel>
}

export type AidantDetailsReadModel = Readonly<{
  coopId: string
  emails: ReadonlyArray<string>
  lieuxActivite: ReadonlyArray<LieuActiviteReadModel>
  nom: string
  prenom: string
  structureEmployeuse: StructureEmployeuseReadModel
  tags: ReadonlyArray<string>
  telephone: string
}>

export type ContactReadModel = Readonly<{
  email: string
  estReferentFNE: boolean
  fonction: string
  id: number
  nom: string
  prenom: string
  telephone: string
}>

export type AidantDetailsErrorReadModel = Readonly<{
  message: string
  type: 'error'
}>

type LieuActiviteReadModel = Readonly<{
  adresse: string
  idCoopCarto: null | string
  nom: string
}>

type StructureEmployeuseReadModel = Readonly<{
  adresse: string
  contacts: ReadonlyArray<ContactReadModel>
  departement: string
  nom: string
  region: string
  siret: string
  type: string
}>
