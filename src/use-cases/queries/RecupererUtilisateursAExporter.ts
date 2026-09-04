import { QueryHandler } from '../QueryHandler'

export class RecupererUtilisateursAExporter implements QueryHandler<Query, UtilisateursAExporterReadModel> {
  readonly #loader: UtilisateursAExporterLoader

  constructor(loader: UtilisateursAExporterLoader) {
    this.#loader = loader
  }

  async handle(): Promise<UtilisateursAExporterReadModel> {
    return this.#loader.get()
  }
}

export interface UtilisateursAExporterLoader {
  get(): Promise<UtilisateursAExporterReadModel>
}

export type UtilisateursAExporterReadModel = ReadonlyArray<UnUtilisateurAExporterReadModel>

export type UnUtilisateurAExporterReadModel = Readonly<{
  departements: ReadonlyArray<string>
  derniereConnexion: Date | null
  email: string
  isActive: boolean
  nom: string
  prenom: string
  role: 'coporteur' | 'gestionnaire département' | 'membre'
  siret: string
  structure: string
  telephone: string
}>

type Query = Readonly<Record<string, never>>
