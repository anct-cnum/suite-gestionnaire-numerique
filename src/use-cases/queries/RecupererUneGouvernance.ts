export interface UneGouvernanceReadModelLoader {
  find: (codeDepartement: string) => Promise<UneGouvernanceReadModel | null>
}

export type UneGouvernanceReadModel = Readonly<{
  departement: string
  comites?: ReadonlyArray<{
    dateProchainComite: Date
    nom: string
    periodicite: string
  }>
  feuillesDeRoute?: ReadonlyArray<{
    budgetGlobal: number
    nom: string
    totalActions: number
  }>
  membres?: ReadonlyArray<{
    nom: string
    roles: ReadonlyArray<string>
    type: string
  }>
  noteDeContexte?: Readonly<{
    dateDeModification: Date
    nomAuteur: string
    prenomAuteur: string
    texte: string
  }>
}>
