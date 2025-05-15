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
  enveloppe: EnveloppeReadModel
  nom: string
  nomFeuilleDeRoute : string
  porteurs?: Array<PorteurPotentielReadModel>
  statut: StatusSubvention
  uid: string
  // ajoute ici tous les champs nécessaires pour le presenter
}

export type BesoinsPossible = 'animer_et_mettre_en_oeuvre_gouvernance' | 'appui_juridique_dedie_gouvernance' |
  'appuyer_certification_qualiopi' | 'coconstruire_feuille_avec_membres' |
  'collecter_donnees_territoriales' | 'etablir_diagnostic_territorial' | 'monter_dossier_subvention' |
  'rediger_feuille' | 'sensibiliser_acteurs' |
  'structurer_filiere_reconditionnement_locale' | 'structurer_fond_local'

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
interface EnveloppeReadModel {
  montant: number
  // autres champs si besoin
}

interface PorteurPotentielReadModel {
  // adapte selon la structure attendue
  id: string
  lien: string
  nom: string
}
