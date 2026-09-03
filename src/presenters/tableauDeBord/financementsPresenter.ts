import {
  EnveloppeConseillerNumeriqueViewModel,
  enveloppesConseillerNumeriquePresenter,
} from './enveloppesConseillerNumeriquePresenter'
import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '../shared/enveloppe'
import { formatMontant, formatMontantEnMillions } from '../shared/number'
import { classifierTypeEnveloppe, TypeEnveloppe } from '@/shared/enveloppeFinancement'
import { EnveloppeConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesEnveloppesConseillerNumerique'

// Règle #1557 : le rendu de l'encart Financements est piloté par les types de financement
// présents (FNE / Conseiller Numérique), et non plus par la typologie du dashboard.
// - aucun type présent -> état vide
// - un seul type présent -> vue simple (donut du total et ventilation par enveloppe)
// - les deux types présents -> vue détaillée (2 chiffres : FNE engagé + Conum versé/conventionné)
export function financementsPresenter(
  donnees: DonneesFinancements,
  options: OptionsFinancements,
  now: Date
): FinancementsViewModel {
  const formater = options.formatage === 'millions' ? formatMontantEnMillions : formatMontant

  const enveloppesTypees = [
    ...donnees.ventilationSubventionsParEnveloppe.map((enveloppe) => ({
      enveloppeTotale: Number(enveloppe.enveloppeTotale),
      label: enveloppe.label,
      montant: Number(enveloppe.total),
      type: classifierTypeEnveloppe(enveloppe.label),
    })),
    ...donnees.enveloppesConseillerNumerique.map((enveloppe) => ({
      enveloppeTotale: enveloppe.plafond,
      label: enveloppe.libelle,
      montant: Number(enveloppe.consommation),
      type: 'conseiller_numerique' as const,
    })),
  ].filter((enveloppe) => enveloppe.montant > 0)

  const typesPresents = new Set<TypeEnveloppe>(enveloppesTypees.map((enveloppe) => enveloppe.type))

  if (typesPresents.size === 0) {
    return { vue: 'vide' }
  }

  if (typesPresents.size === 1) {
    const totalFinancements = enveloppesTypees.reduce((accumulateur, { montant }) => accumulateur + montant, 0)
    return {
      totalFinancements: formater(totalFinancements),
      ventilation: enveloppesTypees.map(({ label, montant }) => {
        const couleur = obtenirCouleurEnveloppe(label)
        return {
          color: couleur,
          couleurGraphique: obtenirCouleurGraphique(couleur),
          label,
          montant,
          total: formater(montant),
        }
      }),
      vue: 'simple',
    }
  }

  return {
    conseillerNumerique: {
      complementConventionne: options.complementConventionne,
      conventionne: formater(Number(donnees.conseillerNumerique.conventionne)),
      verse: formater(Number(donnees.conseillerNumerique.verse)),
    },
    enveloppesConseillerNumerique: enveloppesConseillerNumeriquePresenter(donnees.enveloppesConseillerNumerique, now),
    fne: {
      engage: formater(Number(donnees.fneEngage)),
      reference:
        donnees.fneReference === undefined
          ? undefined
          : {
              libelle: donnees.fneReference.libelle,
              montant: formater(Number(donnees.fneReference.montant)),
            },
    },
    jauges: options.jauges,
    nombreDeFinancementsEngagesParLEtat: donnees.nombreDeFinancementsEngagesParLEtat,
    noteMethodologique: options.noteMethodologique,
    ventilationFne: enveloppesTypees
      .filter((enveloppe) => enveloppe.type === 'fne')
      .map(({ enveloppeTotale, label, montant }) => {
        const couleur = obtenirCouleurEnveloppe(label)
        return {
          color: couleur,
          couleurGraphique: obtenirCouleurGraphique(couleur),
          label,
          pourcentageConsomme: enveloppeTotale > 0 ? Math.round((montant / enveloppeTotale) * 100) : 0,
          total: formater(montant),
        }
      }),
    vue: 'detaillee',
  }
}

// Données financières unifiées, quel que soit le dashboard : enveloppes FNE (demandes de
// subvention acceptées) et Conseiller Numérique (conventionné par enveloppe, versé/conventionné cumulés).
export type DonneesFinancements = Readonly<{
  conseillerNumerique: Readonly<{
    conventionne: string
    verse: string
  }>
  enveloppesConseillerNumerique: ReadonlyArray<EnveloppeConseillerNumeriqueReadModel>
  fneEngage: string
  fneReference?: Readonly<{
    libelle: string
    montant: string
  }>
  nombreDeFinancementsEngagesParLEtat: number
  ventilationSubventionsParEnveloppe: ReadonlyArray<
    Readonly<{
      enveloppeTotale: string
      label: string
      total: string
    }>
  >
}>

export type FinancementsViewModel = VueDetailleeViewModel | VueSimpleViewModel | VueVideViewModel

// Variations d'affichage propres au dashboard (formats et libellés), sans effet sur la règle de rendu.
type OptionsFinancements = Readonly<{
  complementConventionne: string
  formatage: 'euros' | 'millions'
  jauges: boolean
  noteMethodologique?: string
}>

type VueVideViewModel = Readonly<{
  vue: 'vide'
}>

type VueSimpleViewModel = Readonly<{
  totalFinancements: string
  ventilation: ReadonlyArray<
    Readonly<{
      color: string
      couleurGraphique: string
      label: string
      montant: number
      total: string
    }>
  >
  vue: 'simple'
}>

type VueDetailleeViewModel = Readonly<{
  conseillerNumerique: Readonly<{
    complementConventionne: string
    conventionne: string
    verse: string
  }>
  enveloppesConseillerNumerique: ReadonlyArray<EnveloppeConseillerNumeriqueViewModel>
  fne: Readonly<{
    engage: string
    reference:
      | Readonly<{
          libelle: string
          montant: string
        }>
      | undefined
  }>
  jauges: boolean
  nombreDeFinancementsEngagesParLEtat: number
  noteMethodologique: string | undefined
  ventilationFne: ReadonlyArray<
    Readonly<{
      color: string
      couleurGraphique: string
      label: string
      pourcentageConsomme: number
      total: string
    }>
  >
  vue: 'detaillee'
}>
