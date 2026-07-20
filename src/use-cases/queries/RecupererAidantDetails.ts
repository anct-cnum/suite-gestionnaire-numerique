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

export type ContactReferentReadModel = Readonly<{
  email: string
  nom: string
  post: string
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
  contactReferent: ContactReferentReadModel
  departement: string
  nom: string
  region: string
  siret: string
  type: string
}>
