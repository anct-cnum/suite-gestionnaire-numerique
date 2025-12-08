import { ErrorReadModel } from './shared/ErrorReadModel'

// Interface pour le loader AC uniquement (depuis la base de données)
export interface AccompagnementsRealisesParACLoader {
  get(territoire: string): Promise<AccompagnementsRealisesParACReadModel | ErrorReadModel>
}

export type AccompagnementsRealisesParACReadModel = Readonly<{
  departement: string
  nombreTotalAC: number
}>
