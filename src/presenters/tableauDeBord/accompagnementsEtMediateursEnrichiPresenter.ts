import { AccompagnementsEtMediateursEnrichiReadModel } from '@/use-cases/queries/RecupererAccompagnementsEtMediateursEnrichi'

export type AccompagnementsEtMediateursEnrichiViewModel = Readonly<{
  beneficiairesAccompagnes: string
  accompagnementsRealises: string
  metriques: Array<{
    chiffre: string
    sousTitre: string
    titre: string
  }>
  thematiques: Array<{
    backgroundColor: string
    couleur: string
    nom: string
    nombreThematiquesRestantes?: number
    pourcentage: number
  }>
  avertissementApiCoop?: string
}>

export function accompagnementsEtMediateursEnrichiPresenter(
  readModel: AccompagnementsEtMediateursEnrichiReadModel
): AccompagnementsEtMediateursEnrichiViewModel {
  // Trier les thématiques par pourcentage décroissant
  const thematiquesTries = [...readModel.thematiques].sort(
    (thematique1, thematique2) => thematique2.pourcentage - thematique1.pourcentage
  )

  // Couleurs dans l'ordre d'importance (du plus important au moins important)
  // Ces couleurs correspondent aux variables CSS du DSFR dans Dot.module.css
  const couleursOrdrées = [
    '#66673D', // var(--green-tilleul-verveine-sun-418-moon-817)
    '#B7A73F', // var(--green-tilleul-verveine-main-707)
    '#E2CF58', // var(--green-tilleul-verveine-850-200)
    '#FBE769', // var(--green-tilleul-verveine-925-125)
    '#CECECE', // var(--grey-900-175)
  ]

  // Classes CSS pour les dots dans l'ordre d'importance
  const classesCSSOrdrées = [
    'dot-tilleul-418',
    'dot-tilleul-707',
    'dot-tilleul-850',
    'dot-tilleul-925',
    'dot-neutre-900',
  ]

  return {
    beneficiairesAccompagnes: readModel.beneficiairesAccompagnes.toLocaleString('fr-FR'),
    accompagnementsRealises: readModel.accompagnementsRealises.toLocaleString('fr-FR'),
    metriques: [
      {
        chiffre: readModel.mediateursNumeriques.toLocaleString('fr-FR'),
        sousTitre: `Dont ${readModel.conseillerNumeriques.toLocaleString('fr-FR')} Conseillers numériques`,
        titre: 'Médiateurs numériques',
      },
      {
        chiffre: readModel.mediateursFormes.toLocaleString('fr-FR'),
        sousTitre: `Soit ${readModel.pourcentageMediateursFormes}% des médiateurs numériques`,
        titre: 'Médiateurs numériques formés',
      },
      {
        chiffre: readModel.habilitesAidantsConnect.toLocaleString('fr-FR'),
        sousTitre: `Au sein de ${readModel.structuresHabilitees.toLocaleString('fr-FR')} structures habilitées`,
        titre: 'Habilités Aidants Connect',
      },
    ],
    thematiques: thematiquesTries.map((thematique, index) => ({
      backgroundColor: couleursOrdrées[index] || '#CECECE',
      couleur: classesCSSOrdrées[index] || 'dot-neutre-900',
      nom: thematique.nom,
      nombreThematiquesRestantes: thematique.nombreThematiquesRestantes,
      pourcentage: thematique.pourcentage,
    })),
    // Avertissement si erreur API Coop
    ...(readModel.erreurApiCoop ? {
      avertissementApiCoop: 'Certaines données des bénéficiaires ne sont pas disponibles'
    } : {})
  }
}