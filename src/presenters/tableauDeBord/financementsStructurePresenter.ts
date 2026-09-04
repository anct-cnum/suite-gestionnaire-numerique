import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '../shared/enveloppe'
import { formatMontant } from '../shared/number'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FinancementsStructureReadModel } from '@/use-cases/queries/RecupererFinancementsStructure'
import { EnveloppeConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesEnveloppesConseillerNumerique'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

// Fix #1557 : le donut historique ne sommait que le FNE et affichait le Conum dans un bloc séparé.
// On fond ici les enveloppes Conum dans la ventilation et le total pour que la somme = le total.
export function financementsStructurePresenter(
  readModel: ErrorReadModel | FinancementsStructureReadModel,
  enveloppesConseillerNumerique: ReadonlyArray<EnveloppeConseillerNumeriqueReadModel> = []
): ErrorViewModel | FinancementsStructureViewModel {
  if (isErrorReadModel(readModel)) {
    return {
      message: readModel.message,
      type: 'error',
    }
  }

  const ventilation = [
    ...readModel.ventilationSubventionsParEnveloppe.map(({ label, total }) => ({ label, montant: Number(total) })),
    ...enveloppesConseillerNumerique
      .filter((enveloppe) => Number(enveloppe.consommation) > 0)
      .map((enveloppe) => ({ label: enveloppe.libelle, montant: Number(enveloppe.consommation) })),
  ]

  const totalFinancements = ventilation.reduce((accumulateur, { montant }) => accumulateur + montant, 0)

  return {
    nombreDeFinancementsEngagesParLEtat: readModel.nombreDeFinancementsEngagesParLEtat,
    totalFinancements: formatMontant(totalFinancements),
    ventilationSubventionsParEnveloppe: ventilation.map(({ label, montant }) => {
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
