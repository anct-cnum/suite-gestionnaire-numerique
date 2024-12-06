
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
}>

export type FeuilleDeRouteReadModel = Readonly<{
  nom: string
  porteur: MembreReadModel
  totalActions: number
  budgetGlobal: number
  actions: ReadonlyArray<Action>
}>

export type Action = Readonly<{
  nom: action
  budgetTotal: number
  montantSubventionDemandee: number
  montantSubventionAccordee: number
  montantSubventionFormationAccordee: number
  montantSubventionFormationDemandee: number
  beneficiaires:Array<MembreReadModel>
  beneficiairesSubventionFormation: Array<MembreReadModel>
  staut: statut
}>

export type MembreReadModel = Readonly<{
  nom: string
  roles: ReadonlyArray<string>
  type: string
}>

type action = 'demandeDeSubvention' | 'demandeDeSubventionFormation'

type statut = 'enCours' | 'terminee' | 'annulee'

export const calculerBudgetGlobal = (actions: ReadonlyArray<Action>): number => {
  return actions.reduce((sum, action) => sum + action.budgetTotal, 0)
}
