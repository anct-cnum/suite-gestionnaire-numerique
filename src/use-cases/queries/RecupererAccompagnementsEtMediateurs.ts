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

