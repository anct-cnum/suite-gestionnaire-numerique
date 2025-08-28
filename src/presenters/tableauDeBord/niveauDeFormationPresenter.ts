import { NiveauDeFormationReadModel } from '@/use-cases/queries/RecupererNiveauDeFormation'

export type NiveauDeFormationViewModel = Readonly<{
  aidantsEtMediateursFormes: string
  formations: Array<{
    backgroundColor: string
    couleur: string
    nom: string
    nombre: string
  }>
  totalAidantsEtMediateurs: string
}>

export function niveauDeFormationPresenter(
  readModel: NiveauDeFormationReadModel
): NiveauDeFormationViewModel {
  // Couleurs dans l'ordre (pas de tri nécessaire, les données arrivent dans l'ordre)
  // Ces couleurs correspondent aux variables CSS du DSFR dans Dot.module.css
  const couleursOrdonnees = [
    '#8D533E', // var(--pink-macaron-sun-406-moon-833)
    '#E18B76', // var(--pink-macaron-main-689)
    '#FCC0B4', // var(--pink-macaron-850-200)
    '#FEE7FC', // var(--purple-glycine-950-100)
    '#F6F6F6', // var(--grey-950-100)
  ]

  // Classes CSS pour les dots dans l'ordre
  const classesCSSOrdonnees = [
    'dot-macaron-406',
    'dot-macaron-689',
    'dot-macaron-850',
    'dot-glycine-950',
    'dot-neutre-950',
  ]

  return {
    aidantsEtMediateursFormes: readModel.aidantsEtMediateursFormes.toLocaleString('fr-FR'),
    formations: readModel.formations.map((formation, index) => ({
      backgroundColor: couleursOrdonnees[index] || '#EEEEEE',
      couleur: classesCSSOrdonnees[index] || 'dot-neutre-950',
      nom: formation.nom,
      nombre: formation.nombre.toLocaleString('fr-FR'),
    })),
    totalAidantsEtMediateurs: readModel.totalAidantsEtMediateurs.toLocaleString('fr-FR'),
  }
}