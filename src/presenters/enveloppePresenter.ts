import { Enveloppe } from './shared/enveloppe'
import { EnveloppeReadModel } from '@/use-cases/queries/RecupererLesEnveloppes'

export function enveloppePresenter(aujourdhui: Date, enveloppe: EnveloppeReadModel, 
  demandeDeSubventionDejaAccordee?: number): Enveloppe {
  const available = aujourdhui >= enveloppe.dateDeDebut && aujourdhui <= enveloppe.dateDeFin
  const budget = enveloppe.budget.type === 'ventile' ? enveloppe.budget.ventile : enveloppe.budget.total
  const montantRestant = 
      demandeDeSubventionDejaAccordee === undefined ? budget : budget - demandeDeSubventionDejaAccordee

  return {
    available,
    budget: montantRestant,
    label: enveloppe.libelle,
    limiteLaDemandeSubvention: enveloppe.budget.type === 'ventile',
    value: String(enveloppe.id),
  }
}
