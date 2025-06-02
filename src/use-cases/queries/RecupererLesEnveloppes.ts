export interface EnveloppesLoader {
  get(uidGouvernance: string): Promise<EnveloppesReadModel>
}

export type EnveloppesReadModel = Readonly<{
  enveloppes: ReadonlyArray<EnveloppeReadModel>
}>

export type EnveloppeReadModel = Readonly<{
  budget: EnveloppeBudget
  dateDeDebut: Date
  dateDeFin: Date
  id: number
  libelle: string
}>

type EnveloppeBudget = 
  | Readonly<{
    total: number
    type: 'nonVentile'
  }>
  | Readonly<{
    total: number
    type: 'ventile'
    ventile: number
  }>
