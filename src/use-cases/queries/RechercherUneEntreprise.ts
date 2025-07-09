import { QueryHandler } from '../QueryHandler'
import { EntrepriseSirene } from '@/components/GestionMembresGouvernance/types'

export class RechercherUneEntreprise implements QueryHandler<Query, EntrepriseReadModel> {
  readonly #sireneLoader: SireneLoader

  constructor(sireneLoader: SireneLoader) {
    this.#sireneLoader = sireneLoader
  }

  async handle(query: Query): Promise<EntrepriseReadModel> {
    return this.#sireneLoader.rechercherParSiret(query.siret)
  }
}

export interface SireneLoader {
  rechercherParSiret(siret: string): Promise<EntrepriseReadModel>
}

export type EntrepriseReadModel = EntrepriseSirene

type Query = Readonly<{
  siret: string
}>