import { QueryHandler } from '../QueryHandler'

export class RechercherUneEntreprise implements QueryHandler<Query, EntrepriseNonTrouvee | EntrepriseReadModel> {
  readonly #rechercheEntrepriseGateway: SireneLoader

  constructor(rechercheEntrepriseGateway: SireneLoader) {
    this.#rechercheEntrepriseGateway = rechercheEntrepriseGateway
  }

  async handle(query: Query): Promise<EntrepriseNonTrouvee | EntrepriseReadModel> {
    return this.#rechercheEntrepriseGateway.rechercherParIdentifiant(query.siret)
  }
}

export interface SireneLoader {
  rechercherParIdentifiant(siret: string): Promise<EntrepriseNonTrouvee | EntrepriseReadModel>
}

export type EntrepriseReadModel = Readonly<{
  activitePrincipale: string
  adresse: string
  categorieJuridiqueCode: string
  categorieJuridiqueLibelle?: string
  codePostal: string
  commune: string
  denomination: string
  identifiant: string
}>

export interface EntrepriseNonTrouvee {
  estTrouvee: false
}

type Query = Readonly<{
  siret: string
}>