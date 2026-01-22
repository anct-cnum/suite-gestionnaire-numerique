import { formaterEnDateFrancaise } from './shared/date'
import { formaterEnNombreFrancais, formatMontant } from './shared/number'
import {
  EtatPoste,
  PosteConseillerNumeriqueReadModel,
  PostesConseillerNumeriqueReadModel,
} from '@/use-cases/queries/RecupererLesPostesConseillerNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type PosteConseillerNumeriqueViewModel = Readonly<{
  bonification: string
  codeDepartement: string
  dateFinContrat: string
  dateFinConvention: string
  estCoordinateur: boolean
  idPoste: number
  nomStructure: string
  posteConumId: number
  sourcesFinancement: string
  statut: EtatPoste
  statutBadgeVariant: BadgeVariant
  statutLabel: string
  totalConventionne: string
  totalVerse: string
}>

export type PostesConseillerNumeriqueStatistiquesViewModel = Readonly<{
  budgetTotalConventionne: string
  budgetTotalVerse: string
  nombreDePostes: string
  nombreDePostesOccupes: string
  nombreDeStructuresConventionnees: string
}>

export type PostesConseillerNumeriqueViewModel = Readonly<{
  displayPagination: boolean
  limite: number
  page: number
  postes: ReadonlyArray<PosteConseillerNumeriqueViewModel>
  statistiques: PostesConseillerNumeriqueStatistiquesViewModel
  total: number
  totalPages: number
}>

export function postesConseillerNumeriquePresenter(
  postesReadModel: ErrorReadModel | PostesConseillerNumeriqueReadModel
): ErrorReadModel | PostesConseillerNumeriqueViewModel {
  if ('type' in postesReadModel) {
    return postesReadModel
  }

  return {
    displayPagination: postesReadModel.displayPagination,
    limite: postesReadModel.limite,
    page: postesReadModel.page,
    postes: postesReadModel.postes.map(transformerPoste),
    statistiques: {
      budgetTotalConventionne: formatMontant(postesReadModel.statistiques.budgetTotalConventionne),
      budgetTotalVerse: formatMontant(postesReadModel.statistiques.budgetTotalVerse),
      nombreDePostes: formaterEnNombreFrancais(postesReadModel.statistiques.nombreDePostes),
      nombreDePostesOccupes: formaterEnNombreFrancais(postesReadModel.statistiques.nombreDePostesOccupes),
      nombreDeStructuresConventionnees: formaterEnNombreFrancais(
        postesReadModel.statistiques.nombreDeStructuresConventionnees
      ),
    },
    total: postesReadModel.total,
    totalPages: postesReadModel.totalPages,
  }
}

type BadgeVariant = 'error' | 'info' | 'warning'

function getStatutLabel(statut: EtatPoste): string {
  const labels: Record<EtatPoste, string> = {
    occupe: 'Occupé',
    rendu: 'Rendu',
    vacant: 'Vacant',
  }
  return labels[statut]
}

function getStatutBadgeVariant(statut: EtatPoste): BadgeVariant {
  const variants: Record<EtatPoste, BadgeVariant> = {
    occupe: 'warning',
    rendu: 'error',
    vacant: 'info',
  }
  return variants[statut]
}

function formaterEnveloppes(enveloppes: null | string): string {
  if (enveloppes === null) {
    return '-'
  }
  if (enveloppes.includes(',')) {
    return 'Renouvellement'
  }
  const mapping: Record<string, string> = {
    V1: 'Initiale',
    V2: 'Renouvellement',
  }
  return mapping[enveloppes] ?? enveloppes
}

function transformerPoste(poste: PosteConseillerNumeriqueReadModel): PosteConseillerNumeriqueViewModel {
  return {
    bonification: poste.bonification ? 'Oui' : '',
    codeDepartement: poste.codeDepartement,
    dateFinContrat: poste.dateFinContrat === null ? '-' : formaterEnDateFrancaise(poste.dateFinContrat),
    dateFinConvention: poste.dateFinConvention === null ? '-' : formaterEnDateFrancaise(poste.dateFinConvention),
    estCoordinateur: poste.estCoordinateur,
    idPoste: poste.idPoste,
    nomStructure: poste.nomStructure,
    posteConumId: poste.posteConumId,
    sourcesFinancement: formaterEnveloppes(poste.sourcesFinancement),
    statut: poste.statut,
    statutBadgeVariant: getStatutBadgeVariant(poste.statut),
    statutLabel: getStatutLabel(poste.statut),
    totalConventionne: poste.totalConventionne > 0 ? formatMontant(poste.totalConventionne) : '-',
    totalVerse: poste.totalVerse > 0 ? formatMontant(poste.totalVerse) : '-',
  }
}
