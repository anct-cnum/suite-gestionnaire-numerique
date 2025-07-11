import { formatMontant } from '../shared/number'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'
 
export function financementsPresenter(
  readModel: ErrorReadModel | TableauDeBordLoaderFinancements
): ErrorViewModel | FinancementViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  const couleursEnveloppes = {
    'Conseiller Numérique - 2024 - État' :   'dot-purple-glycine-main-494',
    'Conseiller Numérique - Plan France Relance - État' : 'dot-purple-glycine-850-200',
    'Formation Aidant Numérique/Aidants Connect - 2024 - État' : 'dot-green-tilleul-verveine-925',
    'Ingénierie France Numérique Ensemble - 2024 - État' : 'dot-orange-terre-battue-850-200',
  }
  return {
    budget: {
      feuillesDeRouteWording: `${readModel.budget.feuillesDeRoute} feuille${readModel.budget.feuillesDeRoute > 1 ? 's' : ''} de route`,
      total: formatMontant(Number(readModel.budget.total)),
    },
    credit: {
      pourcentage: readModel.credit.pourcentage,
      total: formatMontant(Number(readModel.credit.total)),
    },
    nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
    ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe.map(
      ({ label, total }) => ({
        color: label in couleursEnveloppes ? couleursEnveloppes[label as keyof typeof couleursEnveloppes] : 'dot-purple-glycine-main-494',
        label,
        total: formatMontant(Number(total)),
      })
    ),
  }
}

export type FinancementViewModel = Readonly<{
  budget: Readonly<{
    feuillesDeRouteWording: string
    total: string
  }>
  credit: Readonly<{
    pourcentage: number
    total: string
  }>
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<{
    color: string
    label: string
    total: string
  }>
}>

function isErrorReadModel(readModel: ErrorReadModel | TableauDeBordLoaderFinancements): readModel is ErrorReadModel {
  return 'type' in readModel
}