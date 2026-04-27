import { obtenirCouleurEnveloppe } from '../shared/enveloppe'
import { formatMontantEnMillions } from '../shared/number'
import { EnveloppeConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesEnveloppesConseillerNumerique'

export function enveloppesConseillerNumeriquePresenter(
  enveloppes: ReadonlyArray<EnveloppeConseillerNumeriqueReadModel>,
  now: Date
): ReadonlyArray<EnveloppeConseillerNumeriqueViewModel> {
  return enveloppes.map((enveloppe) => {
    const consommation = Number(enveloppe.consommation)
    const plafond = enveloppe.plafond
    const pourcentageConsomme = plafond > 0 ? Math.round((consommation / plafond) * 100) : 0

    return {
      color: obtenirCouleurEnveloppe(enveloppe.libelle),
      disponible: now >= enveloppe.dateDeDebut && now <= enveloppe.dateDeFin,
      label: enveloppe.libelle,
      pourcentageConsomme,
      total: formatMontantEnMillions(consommation),
    }
  })
}

export type EnveloppeConseillerNumeriqueViewModel = Readonly<{
  color: string
  disponible: boolean
  label: string
  pourcentageConsomme: number
  total: string
}>
