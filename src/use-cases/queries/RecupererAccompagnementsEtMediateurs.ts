import { ErrorReadModel } from './shared/ErrorReadModel'

export type AccompagnementsEtMediateursReadModel = Readonly<{
  conseillerNumeriques: number
  habilitesAidantsConnect: number
  mediateursFormes: number
  mediateursNumeriques: number
  pourcentageMediateursFormes: number
  structuresHabilitees: number
  thematiques: Array<{
    nom: string
    nombreThematiquesRestantes?: number
    pourcentage: number
  }>
}>

export interface AccompagnementsEtMediateursLoader {
  get(territoire?: string): Promise<AccompagnementsEtMediateursReadModel | ErrorReadModel>
}

export class RecupererAccompagnementsEtMediateurs {
  private readonly accompagnementsLoader: AccompagnementsEtMediateursLoader
  
  constructor(
    accompagnementsLoader: AccompagnementsEtMediateursLoader
  ) {
    this.accompagnementsLoader = accompagnementsLoader
  }

  async execute(query: RecupererAccompagnementsEtMediateursQuery): 
  Promise<AccompagnementsEtMediateursReadModel | ErrorReadModel> {
    return this.accompagnementsLoader.get(query.territoire)
  }
}

type RecupererAccompagnementsEtMediateursQuery = Readonly<{
  territoire?: string
}>

