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
    budgetGlobalRenseigne: formatMontant(Number(readModel.budgetGlobalRenseigne)),
    conseillerNumerique: {
      conventionne: formatMontant(Number(readModel.conseillerNumerique.conventionne)),
      verse: formatMontant(Number(readModel.conseillerNumerique.verse)),
    },
    fneEngage: formatMontant(Number(readModel.fneEngage)),
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
          total: formatMontant(montantUtilise),
        }
      }
    ),
  }
}

export type FinancementViewModel = Readonly<{
  budgetGlobalRenseigne: string
  conseillerNumerique: Readonly<{
    conventionne: string
    verse: string
  }>
  fneEngage: string
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
