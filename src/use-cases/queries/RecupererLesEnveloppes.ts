export interface EnveloppesLoader {
  get(uidGouvernance: string): Promise<EnveloppesReadModel>
}

export type EnveloppesReadModel = Readonly<{
  enveloppes: ReadonlyArray<EnveloppeReadModel>
}>

export type EnveloppeReadModel = Readonly<{
  dateDeDebut: Date
  dateDeFin: Date
  id: number
  libelle: string
  montant: number
}> 