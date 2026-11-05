import { formaterEnDateFrancaise } from './shared/date'
import {
  AppariementLieuReadModel,
  AppariementsLieuxReadModel,
  StatutAppariement,
  VisibiliteDuRecord,
} from '@/use-cases/queries/RechercherAppariementsLieux'

const LIBELLE_STATUT: Readonly<Record<StatutAppariement, string>> = {
  a_valider: 'À valider',
  rejete: 'Rejetés',
  valide: 'Validés',
}

const VISIBILITE: Readonly<Record<VisibiliteDuRecord, VisibiliteViewModel>> = {
  absent: { couleur: 'info', libelle: 'Absent de la carte' },
  masque: { couleur: 'warning', libelle: 'Masqué sur la carte' },
  supprime: { couleur: 'error', libelle: 'Supprimé' },
  visible: { couleur: 'success', libelle: 'Visible sur la carte' },
}

export function appariementsLieuxPresenter(
  readModel: AppariementsLieuxReadModel,
  statut: StatutAppariement
): AppariementsLieuxViewModel {
  return {
    appariements: readModel.appariements.map(versAppariementViewModel),
    onglets: (['a_valider', 'valide', 'rejete'] as const).map((candidat) => ({
      estActif: candidat === statut,
      label: LIBELLE_STATUT[candidat],
      nombre: readModel.compteurs[candidat],
      statut: candidat,
    })),
    statut,
    total: readModel.total,
  }
}

export type AppariementsLieuxViewModel = Readonly<{
  appariements: ReadonlyArray<AppariementLieuViewModel>
  onglets: ReadonlyArray<OngletStatutViewModel>
  statut: StatutAppariement
  total: number
}>

export type OngletStatutViewModel = Readonly<{
  estActif: boolean
  label: string
  nombre: number
  statut: StatutAppariement
}>

export type AppariementLieuViewModel = Readonly<{
  carto: Readonly<{
    adresse: string
    nom: string
    recordId: string
    segments: string
    source: string
    visibilite: VisibiliteViewModel
  }>
  cle: string
  // Renseigné pour les statuts valide / rejete.
  decision: null | Readonly<{ le: string; par: string }>
  distance: string
  lieu: Readonly<{
    adresse: string
    id: number
    nom: string
    visibilite: VisibiliteViewModel
  }>
  // Paire à arbitrer dont la validation fait disparaître le lieu de la carte :
  // la fiche publiée s'efface au profit d'un lieu retenu masqué ou supprimé.
  retireDeLaCarte: boolean
  scores: Readonly<{
    adresse: string
    distance: string
    global: string
    nom: string
  }>
  statut: StatutAppariement
}>

export type VisibiliteViewModel = Readonly<{
  couleur: 'error' | 'info' | 'success' | 'warning'
  libelle: string
}>

function versAppariementViewModel(appariement: AppariementLieuReadModel): AppariementLieuViewModel {
  const { carto, lieu, scores } = appariement

  return {
    carto: {
      adresse: adresseEtCommune(carto.adresse, carto.commune),
      nom: carto.nom ?? carto.recordId,
      recordId: carto.recordId,
      segments: carto.segments.join(' + '),
      source: carto.source ?? 'Source inconnue',
      visibilite: VISIBILITE[carto.visibilite],
    },
    cle: `${carto.recordId}|${lieu.id}`,
    decision:
      appariement.decideLe === null
        ? null
        : { le: formaterEnDateFrancaise(appariement.decideLe), par: appariement.decidePar ?? 'Inconnu' },
    distance: formaterDistance(appariement.distanceM),
    lieu: {
      adresse: adresseEtCommune(
        [lieu.numeroVoie, lieu.repetition, lieu.nomVoie].filter((partie) => partie !== null && partie !== '').join(' '),
        lieu.commune
      ),
      id: lieu.id,
      nom: lieu.nom,
      visibilite: VISIBILITE[lieu.visibilite],
    },
    retireDeLaCarte:
      appariement.statut === 'a_valider' && carto.visibilite === 'visible' && lieu.visibilite !== 'visible',
    scores: {
      adresse: formaterScore(scores.adresse),
      distance: formaterScore(scores.distance),
      global: formaterScore(scores.global),
      nom: formaterScore(scores.nom),
    },
    statut: appariement.statut,
  }
}

function adresseEtCommune(adresse: null | string, commune: null | string): string {
  const parties = [adresse, commune].filter((partie) => partie !== null && partie !== '')

  return parties.length === 0 ? '—' : parties.join(', ')
}

function formaterScore(score: null | number): string {
  return score === null ? '—' : String(score)
}

// Distance entre les deux géolocalisations : en mètres, en kilomètres au-delà de 1 km.
function formaterDistance(distanceM: null | number): string {
  if (distanceM === null) {
    return '—'
  }
  if (distanceM < 1000) {
    return `${distanceM} m`
  }

  return `${(distanceM / 1000).toLocaleString('fr-FR', { maximumFractionDigits: 1 })} km`
}
