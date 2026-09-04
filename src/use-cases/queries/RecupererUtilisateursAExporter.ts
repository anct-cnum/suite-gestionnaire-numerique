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
  derniereConnexion: Date | null
  email: string
  isActive: boolean
  nom: string
  prenom: string
  role: RoleAExporter
  siret: string
  structure: string
  telephone: string
  territoires: ReadonlyArray<string>
}>

export type RoleAExporter =
  | 'administrateur dispositif'
  | 'coporteur'
  | 'gestionnaire département'
  | 'gestionnaire région'
  | 'membre'

type Query = Readonly<Record<string, never>>
