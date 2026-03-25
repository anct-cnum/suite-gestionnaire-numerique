import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '../shared/enveloppe'
import { formatMontant } from '../shared/number'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FinancementsStructureReadModel } from '@/use-cases/queries/RecupererFinancementsStructure'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

export function financementsStructurePresenter(
  readModel: ErrorReadModel | FinancementsStructureReadModel
): ErrorViewModel | FinancementsStructureViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  const totalFinancements = Number(readModel.totalFinancements)

  return {
    nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
    totalFinancements: formatMontant(totalFinancements),
    ventilationSubventionsParEnveloppe: readModel.ventilationSubventionsParEnveloppe.map(({ label, total }) => {
      const montant = Number(total)
      const couleur = obtenirCouleurEnveloppe(label)
      return {
        color: couleur,
        couleurGraphique: obtenirCouleurGraphique(couleur),
        label,
        montant,
        total: formatMontant(montant),
      }
    }),
  }
}

export type FinancementsStructureViewModel = Readonly<{
  nombreDeFinancementsEngagesParLEtat: number
  totalFinancements: string
  ventilationSubventionsParEnveloppe: ReadonlyArray<
    Readonly<{
      color: string
      couleurGraphique: string
      label: string
      montant: number
      total: string
    }>
  >
}>

function isErrorReadModel(readModel: ErrorReadModel | FinancementsStructureReadModel): readModel is ErrorReadModel {
  return 'type' in readModel
}
