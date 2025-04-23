export type UneActionReadModel = Readonly<{
  besoins?: Array<BesoinsPossible>
}>

export type BesoinsPossible = 'animer_et_mettre_en_oeuvre_gouvernance' | 'appui_juridique_dedie_gouvernance' |
  'appuyer_certification_qualiopi' | 'coconstruire_feuille_avec_membres' |
  'collecter_donnees_territoriales' | 'etablir_diagnostic_territorial' | 'monter_dossier_subvention' |
  'rediger_feuille' | 'sensibiliser_acteurs' |
  'structurer_filiere_reconditionnement_locale' | 'structurer_fond_local'
