import { ErrorReadModel } from './shared/ErrorReadModel'

export interface RejoindreUneGouvernanceLoader {
  get(structureId: number): Promise<ErrorReadModel | RejoindreUneGouvernanceReadModel>
}

export type RejoindreUneGouvernanceReadModel = Readonly<{
  departementsDisponibles: ReadonlyArray<
    Readonly<{
      code: string
      nom: string
    }>
  >
  structure: Readonly<{
    activitePrincipaleCode: null | string
    activitePrincipaleLibelle: null | string
    adresse: string
    categorieJuridiqueCode: null | string
    categorieJuridiqueLibelle: null | string
    nom: string
    siret: string
  }>
}>
