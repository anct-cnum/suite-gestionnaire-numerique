import { ActivitesStructureReadModel } from '@/use-cases/queries/RecupererActivitesStructure'

const NOMBRE_DE_MOIS = 6
const NOMBRE_DE_JOURS = 30
// Couleurs en dur car Chart.js dessine sur canvas (pas de variable CSS possible)
const COULEUR_BARRES = '#009099' // var(--green-archipel-main-557)
const COULEUR_BARRES_AIDANTS_CONNECT = '#ce614a' // var(--pink-tuile-main-556)

export function activitesStructurePresenter(
  readModel: ActivitesStructureReadModel,
  structureId: number,
  now: Date
): ActivitesStructureViewModel {
  return {
    beneficiaires: {
      accompagnes: readModel.beneficiaires.total.toLocaleString('fr-FR'),
      anonymes: readModel.beneficiaires.anonymes.toLocaleString('fr-FR'),
      suivis: readModel.beneficiaires.suivis.toLocaleString('fr-FR'),
    },
    graphique: {
      parJour: serieGraphique(readModel.parJour, NOMBRE_DE_JOURS, () => labelsJournaliers(now)),
      parMois: serieMensuelle(readModel, now),
    },
    lienStatistiques: `/statistiques?structuresEmployeuses=${structureId}`,
    totalAidantsConnect: readModel.accompagnementsAidantsConnect.toLocaleString('fr-FR'),
    totalMediationNumerique: readModel.accompagnementsMediationNumerique.toLocaleString('fr-FR'),
  }
}

export type ActivitesStructureViewModel = Readonly<{
  beneficiaires: Readonly<{
    accompagnes: string
    anonymes: string
    suivis: string
  }>
  graphique: Readonly<{
    parJour: SerieGraphiqueViewModel
    parMois: SerieGraphiqueViewModel
  }>
  lienStatistiques: string
  totalAidantsConnect: string
  totalMediationNumerique: string
}>

type SerieGraphiqueViewModel = Readonly<{
  aidantsConnect?: Readonly<{
    backgroundColor: ReadonlyArray<string>
    data: ReadonlyArray<number>
  }>
  backgroundColor: ReadonlyArray<string>
  data: ReadonlyArray<number>
  labels: ReadonlyArray<string>
}>

function serieGraphique(
  points: ActivitesStructureReadModel['parMois'],
  taille: number,
  labelsParDefaut: () => ReadonlyArray<string>
): SerieGraphiqueViewModel {
  // L'API Coop renvoie des séries déjà libellées : on ne garde que les dernières périodes.
  const derniersPoints = points.slice(-taille)
  const labels = derniersPoints.length > 0 ? derniersPoints.map((point) => point.label) : labelsParDefaut()
  const data = derniersPoints.length > 0 ? derniersPoints.map((point) => point.count) : labels.map(() => 0)

  return {
    backgroundColor: labels.map(() => COULEUR_BARRES),
    data,
    labels,
  }
}

function serieMensuelle(readModel: ActivitesStructureReadModel, now: Date): SerieGraphiqueViewModel {
  const base = serieGraphique(readModel.parMois, NOMBRE_DE_MOIS, () => labelsMensuels(now))
  // Les mois Aidants Connect sont alignés sur la fenêtre des labels en partant du principe
  // que le dernier point (Coop ou par défaut) correspond au mois courant.
  const totauxParMois = new Map(readModel.parMoisAidantsConnect.map((point) => [point.mois, point.total]))
  const data = base.labels.map((_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (base.labels.length - 1 - index), 1)
    return totauxParMois.get(cleMois(date)) ?? 0
  })

  return {
    ...base,
    aidantsConnect: {
      backgroundColor: base.labels.map(() => COULEUR_BARRES_AIDANTS_CONNECT),
      data,
    },
  }
}

function cleMois(date: Date): string {
  return `${String(date.getFullYear())}-${String(date.getMonth() + 1).padStart(2, '0')}`
}

function labelsMensuels(now: Date): ReadonlyArray<string> {
  return Array.from({ length: NOMBRE_DE_MOIS }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth() - (NOMBRE_DE_MOIS - 1) + index, 1)
    return date.toLocaleDateString('fr-FR', { month: 'short' })
  })
}

function labelsJournaliers(now: Date): ReadonlyArray<string> {
  return Array.from({ length: NOMBRE_DE_JOURS }, (_, index) => {
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (NOMBRE_DE_JOURS - 1) + index)
    return date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })
  })
}
