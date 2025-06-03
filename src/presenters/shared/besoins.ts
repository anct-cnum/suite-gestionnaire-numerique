import { LabelValue } from './labels'
import { BesoinsPossible } from '@/use-cases/queries/shared/ActionReadModel'

export const BESOINS_LABELS: Record<BesoinsPossible, string> = {
  [BesoinsPossible.ANIMER_LA_GOUVERNANCE]: 'Animer et mettre en œuvre la gouvernance et la feuille de route',
  [BesoinsPossible.APPUI_JURIDIQUE]: 'Appui juridique dédié à la gouvernance',
  [BesoinsPossible.APPUYER_LA_CERTIFICATION_QUALIOPI]: 'Appuyer la certification Qualiopi de structures privées portant des formations à l’inclusion numérique',
  [BesoinsPossible.CO_CONSTRUIRE_LA_FEUILLE_DE_ROUTE]: 'Co-construire la feuille de route avec les membres',
  [BesoinsPossible.COLLECTER_DES_DONNEES_TERRITORIALES]: 'Collecter des données territoriales pour alimenter un hub national',
  [BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL]: 'Établir un diagnostic territorial',
  [BesoinsPossible.MONTER_DOSSIERS_DE_SUBVENSION]: 'Monter des dossiers de subvention complexes',
  [BesoinsPossible.REDIGER_LA_FEUILLE_DE_ROUTE]: 'Rédiger la feuille de route',
  [BesoinsPossible.SENSIBILISER_LES_ACTEURS_AUX_OUTILS_EXISTANTS]: 'Sensibiliser les acteur de l’inclusion numérique aux outils existants',
  [BesoinsPossible.STRUCTURER_UN_FONDS]: 'Structurer un fond local pour l’inclusion numérique',
  [BesoinsPossible.STRUCTURER_UNE_FILIERE_DE_RECONDITIONNEMENT]: 'Structurer une filière de reconditionnement locale',
}

export const BESOINS_CATEGORIES = {
  financements: [
    BesoinsPossible.STRUCTURER_UN_FONDS,
    BesoinsPossible.MONTER_DOSSIERS_DE_SUBVENSION,
    BesoinsPossible.ANIMER_LA_GOUVERNANCE,
  ],
  formations: [
    BesoinsPossible.ETABLIR_UN_DIAGNOSTIC_TERRITORIAL,
    BesoinsPossible.CO_CONSTRUIRE_LA_FEUILLE_DE_ROUTE,
    BesoinsPossible.REDIGER_LA_FEUILLE_DE_ROUTE,
    BesoinsPossible.APPUI_JURIDIQUE,
  ],
  formationsProfessionnels: [
    BesoinsPossible.APPUYER_LA_CERTIFICATION_QUALIOPI,
  ],
  outillages: [
    BesoinsPossible.STRUCTURER_UNE_FILIERE_DE_RECONDITIONNEMENT,
    BesoinsPossible.COLLECTER_DES_DONNEES_TERRITORIALES,
    BesoinsPossible.SENSIBILISER_LES_ACTEURS_AUX_OUTILS_EXISTANTS,
  ],
} as const

export function createBesoinsLabelValue(besoin: BesoinsPossible, isSelected: boolean): LabelValue<BesoinsPossible> {
  return {
    isSelected,
    label: BESOINS_LABELS[besoin],
    value: besoin,
  }
} 