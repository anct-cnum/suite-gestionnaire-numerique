
export interface LieuxInclusionNumeriqueLoader {
  get(codeDepartement: string): Promise<LieuxInclusionNumeriqueReadModel>
}

export type LieuxInclusionNumeriqueReadModel = Readonly<{
  departement: string
  nombreLieux: number
}>
