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
    conseillerNumerique: {
      conventionne: formatMontantEnMillions(Number(readModel.conseillerNumerique.conventionne)),
      verse: formatMontantEnMillions(Number(readModel.conseillerNumerique.verse)),
    },
    fneDisponible: formatMontantEnMillions(Number(readModel.fneDisponible)),
    fneEngage: formatMontantEnMillions(Number(readModel.fneEngage)),
    nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
    ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe.map(
      ({ enveloppeTotale, label, total }) => {
        const montantUtilise = Number(total)
        const montantTotal = Number(enveloppeTotale)
        const pourcentageConsomme = montantTotal > 0 ? Math.round((montantUtilise / montantTotal) * 100) : 0

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
  conseillerNumerique: Readonly<{
    conventionne: string
    verse: string
  }>
  fneDisponible: string
  fneEngage: string
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<{
    color: string
    label: string
    pourcentageConsomme: number
    total: string
  }>
}>

function isErrorReadModel(
  readModel: ErrorReadModel | TableauDeBordLoaderFinancementsAdmin
): readModel is ErrorReadModel {
  return 'type' in readModel
}
