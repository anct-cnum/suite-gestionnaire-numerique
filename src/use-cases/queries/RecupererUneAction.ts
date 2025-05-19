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

export enum BesoinsPossible {
  ANIMER_LA_GOUVERNANCE = 'animer_la_gouvernance',
  APPUI_JURIDIQUE = 'appui_juridique',
  APPUYER_LA_CERTIFICATION_QUALIOPI = 'appuyer_la_certification_qualiopi',
  CO_CONSTRUIRE_LA_FEUILLE_DE_ROUTE = 'co_construire_la_feuille_de_route',
  COLLECTER_DES_DONNEES_TERRITORIALES = 'collecter_des_donnees_territoriales',
  ETABLIR_UN_DIAGNOSTIC_TERRITORIAL = 'etablir_un_diagnostic_territorial',
  MONTER_DOSSIERS_DE_SUBVENSION = 'monter_dossiers_de_subvention',
  REDIGER_LA_FEUILLE_DE_ROUTE = 'rediger_la_feuille_de_route',
  SENSIBILISER_LES_ACTEURS_AUX_OUTILS_EXISTANTS = 'sensibiliser_les_acteurs_aux_outils_existants',
  STRUCTURER_UN_FONDS = 'structurer_un_fonds',
  STRUCTURER_UNE_FILIERE_DE_RECONDITIONNEMENT = 'structurer_une_filiere_de_reconditionnement'
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
