import { SlugFraicheur } from '@/shared/fraicheur'
import { PointsVigilanceLieuxReadModel } from '@/use-cases/queries/RecupererPointsVigilanceLieux'

export type PointVigilanceViewModel = Readonly<{
  compteur: string
  pastille: string
  texte: string
  url: string
}>

export type PointsVigilanceLieuxViewModel = Readonly<{
  lignes: ReadonlyArray<PointVigilanceViewModel>
}>

// Une ligne n'est affichée que si son compteur est non nul (#1488). Le codeDepartement est
// transmis pour qu'un administrateur arrivé depuis un tableau de bord départemental retrouve
// le même périmètre sur la liste.
export function pointsVigilanceLieuxPresenter(
  readModel: PointsVigilanceLieuxReadModel,
  codeDepartement?: string
): PointsVigilanceLieuxViewModel {
  const lignes: Array<PointVigilanceViewModel> = []

  if (readModel.nbLieuxAActualiser > 0) {
    lignes.push({
      compteur: formaterCompteur(readModel.nbLieuxAActualiser),
      pastille: '🔴',
      texte: 'à actualiser (informations de plus de 18 mois)',
      url: urlListeLieux('a-actualiser', codeDepartement),
    })
  }

  if (readModel.nbLieuxAVerifier > 0) {
    lignes.push({
      compteur: formaterCompteur(readModel.nbLieuxAVerifier),
      pastille: '🟠',
      texte: 'à vérifier (informations de 12 à 18 mois)',
      url: urlListeLieux('a-verifier', codeDepartement),
    })
  }

  return { lignes }
}

function formaterCompteur(nombre: number): string {
  return `${nombre.toLocaleString('fr-FR')} ${nombre > 1 ? 'lieux' : 'lieu'}`
}

function urlListeLieux(fraicheur: SlugFraicheur, codeDepartement?: string): string {
  const params = new URLSearchParams({ fraicheur })
  if (codeDepartement !== undefined) {
    params.set('codeDepartement', codeDepartement)
  }
  return `/liste-lieux-inclusion?${params.toString()}`
}
