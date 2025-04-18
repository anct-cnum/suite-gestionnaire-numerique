import { StatutSubvention } from './shared/ActionReadModel'
import { Membre } from './shared/MembresDeLaGouveranceReadModel'

export interface FeuillesDeRouteLoader {
  get(codeDepartement: string): Promise<FeuillesDeRouteReadModel>
}

export type FeuillesDeRouteReadModel = Readonly<{
  feuillesDeRoute: ReadonlyArray<FeuilleDeRouteReadModel>
  porteursPotentielsNouvellesFeuillesDeRouteOuActions: ReadonlyArray<MembreAvecRoleDansLaGouvernance>
  totaux: Readonly<{
    budget: number
    coFinancement: number
    financementAccorde: number
  }>
  uidGouvernance: string
}>

type FeuilleDeRouteReadModel = Readonly<
  {
    actions: ReadonlyArray<ActionReadModel>
    beneficiaires: number
    coFinanceurs: number
    nom: string
    pieceJointe?: Readonly<{
      apercu: string
      emplacement: string
      metadonnees?: Readonly<{
        format: string
        taille: string
        upload: Date
      }>
      nom: string
    }>
    structureCoPorteuse?: Membre
    totaux: Readonly<{
      budget: number
      coFinancement: number
      financementAccorde: number
    }>
    uid: string
  }>

type ActionReadModel = Readonly<{
  beneficiaires: ReadonlyArray<Membre>
  besoins: ReadonlyArray<string>
  budgetGlobal: number
  coFinancements: ReadonlyArray<Readonly<{
    coFinanceur: Membre
    montant: number
  }>>
  contexte: string
  description: string
  nom: string
  porteurs: ReadonlyArray<Membre>
  subvention?: Readonly<{
    enveloppe: string
    montants: Readonly<{
      prestation: number
      ressourcesHumaines: number
    }>
    statut: StatutSubvention
  }>
  totaux: Readonly<{
    coFinancement: number
    financementAccorde: number
  }>
  uid: string
}>

type MembreAvecRoleDansLaGouvernance = Membre & Readonly<{ roles: ReadonlyArray<string> }>
