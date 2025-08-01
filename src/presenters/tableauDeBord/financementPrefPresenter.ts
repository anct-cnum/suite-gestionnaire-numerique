import { obtenirCouleurEnveloppe } from '../shared/enveloppe'
import { formatMontant } from '../shared/number'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function financementsPrefPresenter(
  readModel: ErrorReadModel | TableauDeBordLoaderFinancements
): ErrorViewModel | FinancementViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
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
      ({ enveloppeTotale, label, total }) => {
        const montantUtilise = Number(total)
        const montantTotal = Number(enveloppeTotale)
        const pourcentageConsomme = montantTotal > 0 ? Math.round(montantUtilise / montantTotal * 100) : 0
        
        return {
          color: obtenirCouleurEnveloppe(label),
          label,
          pourcentageConsomme,
          total: formatMontant(montantUtilise),
        }
      }
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
    pourcentageConsomme: number
    total: string
  }>
}>

function isErrorReadModel(readModel: ErrorReadModel | TableauDeBordLoaderFinancements): readModel is ErrorReadModel {
  return 'type' in readModel
}