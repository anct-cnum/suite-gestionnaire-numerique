import { Enveloppe } from './shared/enveloppe'
import { EnveloppeReadModel } from '@/use-cases/queries/RecupererLesEnveloppes'

export function enveloppePresenter(aujourdhui: Date, enveloppe: EnveloppeReadModel): Enveloppe {
  const available = aujourdhui >= enveloppe.dateDeDebut && aujourdhui <= enveloppe.dateDeFin

  return {
    available,
    budget: enveloppe.montant,
    budgetPartage: true,
    label: enveloppe.libelle,
    value: String(enveloppe.id),
  }
}
