import { ErrorReadModel } from './shared/ErrorReadModel'
import { FiltreTerritorial } from './shared/FiltreTerritorial'

// Interface pour le loader AC uniquement (depuis la base de données)
export interface AccompagnementsRealisesParACLoader {
  get(filtre: FiltreTerritorial): Promise<AccompagnementsRealisesParACReadModel | ErrorReadModel>
}

export type AccompagnementsRealisesParACReadModel = Readonly<{
  departement: string
  nombreTotalAC: number
}>
