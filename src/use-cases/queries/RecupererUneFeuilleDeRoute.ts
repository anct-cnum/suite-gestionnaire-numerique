import { BesoinsPossible } from './shared/ActionReadModel'
import { StatutSubvention } from '@/domain/DemandeDeSubvention'

export interface UneFeuilleDeRouteLoader {
  get(codeDepartement: string, uidFeuilleDeRoute: string): Promise<UneFeuilleDeRouteReadModel>
}

export type UneFeuilleDeRouteReadModel = Readonly<{
  actions: ReadonlyArray<{
    beneficiaire: number
    besoins: ReadonlyArray<BesoinsPossible>
    budgetPrevisionnel: number
    coFinancement: Readonly<{
      financeur: number
      montant: number
    }>
    enveloppe: Readonly<{
      libelle: string
      montant: number
    }>
    isEditable: boolean
    isEnveloppeFormation: boolean
    modifiable: boolean
    nom: string
    porteurs: ReadonlyArray<{
      nom: string
      structureId: number
      uid: string
    }>
    statut: 'nonSubventionnee' | StatutSubvention
    subventionDemandee: number
    uid: string
  }>
  beneficiaire: number
  budgetTotalActions: number
  coFinanceur: number
  contextualisation?: string
  document?: Readonly<{
    chemin: string
    nom: string
  }>
  edition: Readonly<{
    date: Date
    nom: string
    prenom: string
  }>
  montantCofinancements: number
  montantFinancementsAccordes: number
  nom: string
  perimetre: string
  porteur?: Readonly<{
    nom: string
    structureId: number
    uid: string
  }>
  uid: string
  uidGouvernance: string
}>
