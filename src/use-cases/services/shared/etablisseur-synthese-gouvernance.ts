import { StatutSubvention } from "@/domain/DemandeDeSubvention"

export type EtablisseurSyntheseGouvernance = (gouvernance: Gouvernance) => SyntheseGouvernance

export type Gouvernance = Readonly<{
  feuillesDeRoute: ReadonlyArray<FeuilleDeRoute>
}>

export type SyntheseGouvernance = Readonly<{
  feuillesDeRoute: ReadonlyArray<SyntheseFeuilleDeRoute>
}> & Synthese

export type Finances = Readonly<{
  budget: Montant
  coFinancement: Montant
  financementAccorde: Montant
  financementDemande: Montant
  financementFormationAccorde: Montant
}>

type FeuilleDeRoute = Readonly<{
  actions: ReadonlyArray<Action>
  uid: string
}>

type Action = Readonly<{
  beneficiaires: ReadonlyArray<Unique>
  budgetGlobal: Montant
  coFinancements: ReadonlyArray<
    Readonly<{
      coFinanceur: Unique
      montant: Montant
    }>
  >
  subvention?: Readonly<{
    isFormation: boolean
    montants: Readonly<{
      prestation: Montant
      ressourcesHumaines: Montant
    }>
    statut: StatutSubvention
  }>
  uid: string
}>

type SyntheseFeuilleDeRoute = Readonly<{
  actions: ReadonlyArray<SyntheseAction>
}> & Synthese & Unique

type SyntheseAction = Synthese & Unique

type Synthese = Finances & Readonly<{
  beneficiaires: Denombrement
  coFinanceurs: Denombrement
}>

type Unique = Readonly<{ uid: string }>

// eslint-disable-next-line sonarjs/redundant-type-aliases
type Denombrement = number

// eslint-disable-next-line sonarjs/redundant-type-aliases
type Montant = number
