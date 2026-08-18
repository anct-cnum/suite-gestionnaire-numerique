// Doublons de professionnels INTRA-source : deux identifiants distincts de la
// même source pour le même nom normalisé sur la même structure administrative.
// Non fusionnables côté entrepôt (cf ticket #1824) : listés pour traitement à
// la source. Mêmes critères que la tâche detecter_doublons_intra_source du DAG
// dataspace personne-reconciliation.
// Pas de QueryHandler : la query est vide (listing intégral sans critère).
export class RecupererDoublonsProfessionnels {
  readonly #loader: DoublonsProfessionnelsLoader

  constructor(loader: DoublonsProfessionnelsLoader) {
    this.#loader = loader
  }

  async handle(): Promise<DoublonsProfessionnelsReadModel> {
    return this.#loader.doublons()
  }
}

export interface DoublonsProfessionnelsLoader {
  doublons(): Promise<DoublonsProfessionnelsReadModel>
}

export type DoublonProfessionnelReadModel = Readonly<{
  nom: string
  personneId1: number
  personneId2: number
  prenom: string
  source: SourceDoublon
  sourceId1: string
  sourceId2: string
  structure: string
  structureAdministrativeId: number
}>

export type DoublonsProfessionnelsReadModel = ReadonlyArray<DoublonProfessionnelReadModel>

export type SourceDoublon = 'aidants-connect' | 'conseiller-numerique' | 'coop'
