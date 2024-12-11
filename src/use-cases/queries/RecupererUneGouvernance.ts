export interface UneGouvernanceReadModelLoader {
  find(codeDepartement: string): Promise<UneGouvernanceReadModel | null>
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
  uid: string
}>

export type ComiteReadModel = Readonly<{
  dateProchainComite: Date
  nom: string
  periodicite: string
  type : TypeDeComite
}>

export type FeuilleDeRouteReadModel = Readonly<{
  nom: string
  porteur: MembreReadModel
  totalActions: number
  budgetGlobal: number
  montantSubventionDemande: number
  montantSubventionAccorde: number
  montantSubventionFormationAccorde: number
  beneficiairesSubvention: ReadonlyArray<MembreReadModel>
  beneficiairesSubventionFormation: ReadonlyArray<MembreReadModel>
}>

export type MembreReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
}>

type TypeDeComite = 'stratégique' | 'technique' | 'consultatif' | 'autre'
