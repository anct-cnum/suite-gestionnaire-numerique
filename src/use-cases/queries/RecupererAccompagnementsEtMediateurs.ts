import { ErrorReadModel } from './shared/ErrorReadModel'

export type AccompagnementsEtMediateursReadModel = Readonly<{
  accompagnementsRealises: number
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
  constructor(
    private readonly accompagnementsLoader: AccompagnementsEtMediateursLoader
  ) {}

  async execute(query: RecupererAccompagnementsEtMediateursQuery): Promise<AccompagnementsEtMediateursReadModel | ErrorReadModel> {
    return this.accompagnementsLoader.get(query.territoire)
  }
}

export type RecupererAccompagnementsEtMediateursQuery = Readonly<{
  territoire?: string
}>

