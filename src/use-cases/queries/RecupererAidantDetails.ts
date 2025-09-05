export interface AidantDetailsLoader {
  findById(id: string, graphiquePeriode?: 'journalier' | 'mensuel'): Promise<AidantDetailsErrorReadModel | AidantDetailsReadModel>
}

export type AidantDetailsReadModel = Readonly<{
  accompagnements: AccompagnementsReadModel
  coopId: string
  email: string
  graphiqueAccompagnements: ReadonlyArray<GraphiqueAccompagnementReadModel>
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

type AccompagnementsReadModel = Readonly<{
  avecAidantsConnect: number
  total: number
}>

type GraphiqueAccompagnementReadModel = Readonly<{
  date: string
  totalAccompagnements: number
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
