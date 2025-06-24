
export interface AccompagnementsRealisesLoader {
  get(codeDepartement: string): Promise<AccompagnementsRealisesReadModel>
}

export type AccompagnementsRealisesReadModel = Readonly<{
  departement: string
  nombreTotal: number
  repartitionMensuelle: ReadonlyArray<RepartitionMensuelleReadModel>
}>

type RepartitionMensuelleReadModel = Readonly<{
  mois: string
  nombre: number
}>
