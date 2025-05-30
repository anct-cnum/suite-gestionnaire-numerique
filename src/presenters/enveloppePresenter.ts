import { Enveloppe } from './shared/enveloppe'
import { EnveloppeReadModel } from '@/use-cases/queries/RecupererLesEnveloppes'

export function enveloppePresenter(aujourdhui: Date, enveloppe: EnveloppeReadModel): Enveloppe {
  const available = aujourdhui >= enveloppe.dateDeDebut && aujourdhui <= enveloppe.dateDeFin
  const budget = enveloppe.budget.type === 'ventile' ? enveloppe.budget.ventile : enveloppe.budget.total
  return {
    available,
    budget,
    label: enveloppe.libelle,
    limiteLaDemandeSubvention: enveloppe.budget.type === 'ventile',
    value: String(enveloppe.id),
  }
}
