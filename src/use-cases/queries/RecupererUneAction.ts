import { StatusSubvention } from './shared/StatusSubvention'

export interface UneActionReadModel {
  anneeDeDebut?: string
  anneeDeFin?: string
  besoins: Array<string>
  budgetGlobal?: number
  coFinancements: Array<CoFinancementReadModel>
  contexte?: string
  demandeDeSubvention : DemandeDeSubventionReadModel | undefined
  description?: string
  destinataires?: Array<PorteurPotentielReadModel>
  nom: string
  nomFeuilleDeRoute : string
  porteurs?: Array<PorteurPotentielReadModel>
  statut: StatusSubvention
  uid: string
  // ajoute ici tous les champs nécessaires pour le presenter
}

export interface CoFinancementReadModel {
  id: string
  montant: number
}

interface DemandeDeSubventionReadModel {
  beneficiaires: Array<PorteurPotentielReadModel>
  enveloppeFinancementId: string
  statut: string
  subventionDemandee: number
  subventionEtp: number
  subventionPrestation: number
}

interface PorteurPotentielReadModel {
  // adapte selon la structure attendue
  id: string
  lien: string
  nom: string
}
