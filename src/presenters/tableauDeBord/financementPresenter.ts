import { formatMontant, formatMontantEnMillions } from '../shared/number'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export type ContexteFinancement = 'admin' | 'departement'

export function financementsPresenter(
  readModel: ErrorReadModel | TableauDeBordLoaderFinancements,
  contexte: ContexteFinancement = 'departement'
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
  
  const formateurMontant = contexte === 'admin' ? formatMontantEnMillions : formatMontant
  
  return {
    budget: {
      feuillesDeRouteWording: `${readModel.budget.feuillesDeRoute} feuille${readModel.budget.feuillesDeRoute > 1 ? 's' : ''} de route`,
      total: formateurMontant(Number(readModel.budget.total)),
    },
    contexte,
    credit: {
      pourcentage: readModel.credit.pourcentage,
      total: formateurMontant(Number(readModel.credit.total)),
    },
    nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
    ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe.map(
      ({ label, total, enveloppeTotale }) => {
        const montantUtilise = Number(total)
        const montantTotal = Number(enveloppeTotale)
        const pourcentageConsomme = montantTotal > 0 ? Math.round((montantUtilise / montantTotal) * 100) : 0
        
        return {
          color: label in couleursEnveloppes ? couleursEnveloppes[label as keyof typeof couleursEnveloppes] : 'dot-purple-glycine-main-494',
          label,
          pourcentageConsomme,
          total: formateurMontant(montantUtilise),
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
  contexte: ContexteFinancement
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