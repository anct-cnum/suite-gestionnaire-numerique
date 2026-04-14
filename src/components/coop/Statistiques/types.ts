// Les types ViewModel sont désormais définis dans le presenter (couche d'anticorruption).
// Ce fichier re-exporte pour que les composants n'aient pas à modifier leurs imports.
export type * from '@/presenters/statistiquesPresenter'
