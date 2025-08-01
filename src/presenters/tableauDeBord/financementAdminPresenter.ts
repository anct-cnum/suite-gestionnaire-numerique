import { obtenirCouleurEnveloppe } from '../shared/enveloppe'
import { formatMontantEnMillions } from '../shared/number'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { TableauDeBordLoaderFinancementsAdmin } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function financementAdminPresenter(
  readModel: ErrorReadModel | TableauDeBordLoaderFinancementsAdmin
): ErrorViewModel | FinancementAdminViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  return {
    creditsEngages: formatMontantEnMillions(Number(readModel.creditsEngages)),
    montantTotalEnveloppes: formatMontantEnMillions(Number(readModel.montantTotalEnveloppes)),
    nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
    nombreEnveloppes: readModel.nombreEnveloppes,
    nombreEnveloppesUtilisees: readModel.nombreEnveloppesUtilisees,
    ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe.map(
      ({ enveloppeTotale, label, total }) => {
        const montantUtilise = Number(total)
        const montantTotal = Number(enveloppeTotale)
        const pourcentageConsomme = montantTotal > 0 ? Math.round(montantUtilise / montantTotal * 100) : 0
        
        return {
          color: obtenirCouleurEnveloppe(label),
          label,
          pourcentageConsomme,
          total: formatMontantEnMillions(montantUtilise),
        }
      }
    ),
  }
}

export type FinancementAdminViewModel = Readonly<{
  creditsEngages: string
  montantTotalEnveloppes: string
  nombreDeFinancementsEngagesParLEtat: number
  nombreEnveloppes: number
  nombreEnveloppesUtilisees: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<{
    color: string
    label: string
    pourcentageConsomme: number
    total: string
  }>
}>

function isErrorReadModel(readModel: ErrorReadModel | TableauDeBordLoaderFinancementsAdmin)
  : readModel is ErrorReadModel {
  return 'type' in readModel
}