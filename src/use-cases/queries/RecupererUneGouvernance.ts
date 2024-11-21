export interface UneGouvernanceReadModelLoader {
  find: (codeDepartement: string) => Promise<UneGouvernanceReadModel | null>
}

export type UneGouvernanceReadModel = Readonly<{
  departement: string
  comites?: ReadonlyArray<ComiteReadModel>
  feuillesDeRoute?: ReadonlyArray<FeuilleDeRouteReadModel>
  membres?: ReadonlyArray<MembreReadModel>
  noteDeContexte?: Readonly<{
    dateDeModification: Date
    nomAuteur: string
    prenomAuteur: string
    texte: string
  }>
}>

export type ComiteReadModel = Readonly<{
  dateProchainComite: Date
  nom: string
  periodicite: string
}>

export type FeuilleDeRouteReadModel = Readonly<{
  budgetGlobal: number
  nom: string
  totalActions: number
}>

export type MembreReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
}>
