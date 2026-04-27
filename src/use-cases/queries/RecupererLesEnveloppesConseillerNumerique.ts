export interface EnveloppesConseillerNumeriqueLoader {
  get(codeDepartement: string): Promise<EnveloppesConseillerNumeriqueReadModel>
}

export type EnveloppesConseillerNumeriqueReadModel = Readonly<{
  enveloppes: ReadonlyArray<EnveloppeConseillerNumeriqueReadModel>
}>

export type EnveloppeConseillerNumeriqueReadModel = Readonly<{
  consommation: bigint
  dateDeDebut: Date
  dateDeFin: Date
  libelle: string
  plafond: number
}>
