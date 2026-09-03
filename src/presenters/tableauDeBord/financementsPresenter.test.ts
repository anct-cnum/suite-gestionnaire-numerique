import { describe, expect, it } from 'vitest'

import { enveloppesConseillerNumeriquePresenter } from './enveloppesConseillerNumeriquePresenter'
import { DonneesFinancements, financementsPresenter, FinancementsViewModel } from './financementsPresenter'
import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '../shared/enveloppe'
import { formatMontant, formatMontantEnMillions } from '../shared/number'
import { epochTime } from '@/shared/testHelper'
import { EnveloppeConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesEnveloppesConseillerNumerique'

// Règle #1557 : le rendu est piloté par les types de financement présents, pas par le dashboard.
describe('financements presenter', () => {
  it("quand il n'y a que du FNE alors la vue est simple avec le total et la ventilation FNE", () => {
    // GIVEN
    const donnees = donneesFinancements({
      ventilationSubventionsParEnveloppe: [
        { enveloppeTotale: '0', label: 'Formation Aidant Numérique/Aidants Connect - 2024 - État', total: '20000' },
        { enveloppeTotale: '0', label: 'Ingénierie France Numérique Ensemble - 2024 - État', total: '45100' },
      ],
    })

    // WHEN
    const viewModel = financementsPresenter(donnees, optionsEuros(), epochTime)

    // THEN
    expect(viewModel).toStrictEqual({
      totalFinancements: formatMontant(65100),
      ventilation: [
        ventilationSimpleAttendue('Formation Aidant Numérique/Aidants Connect - 2024 - État', 20000),
        ventilationSimpleAttendue('Ingénierie France Numérique Ensemble - 2024 - État', 45100),
      ],
      vue: 'simple',
    })
  })

  it("quand il n'y a que du Conum alors la vue est simple avec le total et la ventilation Conum", () => {
    // GIVEN
    const donnees = donneesFinancements({
      conseillerNumerique: { conventionne: '87500', verse: '60000' },
      enveloppesConseillerNumerique: [
        enveloppeConum('Conseiller Numérique - Plan France Relance - État', 50000n),
        enveloppeConum('Conseiller Numérique - Renouvellement - État', 37500n),
      ],
    })

    // WHEN
    const viewModel = financementsPresenter(donnees, optionsEuros(), epochTime)

    // THEN
    expect(viewModel).toStrictEqual({
      totalFinancements: formatMontant(87500),
      ventilation: [
        ventilationSimpleAttendue('Conseiller Numérique - Plan France Relance - État', 50000),
        ventilationSimpleAttendue('Conseiller Numérique - Renouvellement - État', 37500),
      ],
      vue: 'simple',
    })
  })

  it('quand il y a du FNE et du Conum alors la vue est détaillée avec les deux chiffres séparés', () => {
    // GIVEN
    const enveloppesConum = [enveloppeConum('Conseiller Numérique - Plan France Relance - État', 127999n)]
    const donnees = donneesFinancements({
      conseillerNumerique: { conventionne: '127999', verse: '99999' },
      enveloppesConseillerNumerique: enveloppesConum,
      fneEngage: '35100',
      nombreDeFinancementsEngagesParLEtat: 1,
      ventilationSubventionsParEnveloppe: [
        { enveloppeTotale: '100000', label: 'Ingénierie France Numérique Ensemble - 2024 - État', total: '35100' },
      ],
    })

    // WHEN
    const viewModel = financementsPresenter(donnees, optionsEuros(), epochTime)

    // THEN
    expect(viewModel).toStrictEqual({
      conseillerNumerique: {
        complementConventionne: 'conventionnés sur les postes de la structure',
        conventionne: formatMontant(127999),
        verse: formatMontant(99999),
      },
      enveloppesConseillerNumerique: enveloppesConseillerNumeriquePresenter(enveloppesConum, epochTime),
      fne: {
        engage: formatMontant(35100),
        reference: undefined,
      },
      jauges: false,
      nombreDeFinancementsEngagesParLEtat: 1,
      noteMethodologique: undefined,
      ventilationFne: [ventilationDetailleeAttendue('Ingénierie France Numérique Ensemble - 2024 - État', 35100, 35)],
      vue: 'detaillee',
    })
  })

  it('quand la vue est détaillée alors les options de formatage en millions, jauges, note et référence FNE sont appliquées', () => {
    // GIVEN
    const enveloppesConum = [enveloppeConum('Conseiller Numérique - Renouvellement - État', 9_000_000n)]
    const donnees = donneesFinancements({
      conseillerNumerique: { conventionne: '12000000', verse: '9000000' },
      enveloppesConseillerNumerique: enveloppesConum,
      fneEngage: '3200000',
      fneReference: { libelle: 'disponible', montant: '5000000' },
      nombreDeFinancementsEngagesParLEtat: 7,
      ventilationSubventionsParEnveloppe: [
        { enveloppeTotale: '5000000', label: 'Ingénierie France Numérique Ensemble - 2024 - État', total: '3200000' },
      ],
    })

    // WHEN
    const viewModel = financementsPresenter(
      donnees,
      {
        complementConventionne: 'conventionnés sur les postes liés à la gouvernance',
        formatage: 'millions',
        jauges: true,
        noteMethodologique: 'Nombre de demandes de subventions validées des feuilles de route.',
      },
      epochTime
    )

    // THEN
    expect(viewModel).toMatchObject({
      conseillerNumerique: {
        complementConventionne: 'conventionnés sur les postes liés à la gouvernance',
        conventionne: formatMontantEnMillions(12_000_000),
        verse: formatMontantEnMillions(9_000_000),
      },
      fne: {
        engage: formatMontantEnMillions(3_200_000),
        reference: { libelle: 'disponible', montant: formatMontantEnMillions(5_000_000) },
      },
      jauges: true,
      noteMethodologique: 'Nombre de demandes de subventions validées des feuilles de route.',
      ventilationFne: [expect.objectContaining({ pourcentageConsomme: 64, total: formatMontantEnMillions(3_200_000) })],
      vue: 'detaillee',
    })
  })

  it("quand il n'y a aucun financement alors la vue est vide", () => {
    // WHEN
    const viewModel = financementsPresenter(donneesFinancements({}), optionsEuros(), epochTime)

    // THEN
    expect(viewModel).toStrictEqual({ vue: 'vide' })
  })

  it('quand toutes les enveloppes Conum sont à 0 alors seul le FNE compte comme présent et la vue est simple', () => {
    // GIVEN
    const donnees = donneesFinancements({
      enveloppesConseillerNumerique: [enveloppeConum('Conseiller Numérique - Renouvellement - État', 0n)],
      fneEngage: '35100',
      ventilationSubventionsParEnveloppe: [
        { enveloppeTotale: '0', label: 'Ingénierie France Numérique Ensemble - 2024 - État', total: '35100' },
      ],
    })

    // WHEN
    const viewModel = financementsPresenter(donnees, optionsEuros(), epochTime)

    // THEN
    expect(viewModel).toStrictEqual({
      totalFinancements: formatMontant(35100),
      ventilation: [ventilationSimpleAttendue('Ingénierie France Numérique Ensemble - 2024 - État', 35100)],
      vue: 'simple',
    })
  })
})

function donneesFinancements(surcharge: Partial<DonneesFinancements>): DonneesFinancements {
  return {
    conseillerNumerique: { conventionne: '0', verse: '0' },
    enveloppesConseillerNumerique: [],
    fneEngage: '0',
    nombreDeFinancementsEngagesParLEtat: 0,
    ventilationSubventionsParEnveloppe: [],
    ...surcharge,
  }
}

function optionsEuros(): Parameters<typeof financementsPresenter>[1] {
  return {
    complementConventionne: 'conventionnés sur les postes de la structure',
    formatage: 'euros',
    jauges: false,
  }
}

function enveloppeConum(libelle: string, consommation: bigint): EnveloppeConseillerNumeriqueReadModel {
  return { consommation, dateDeDebut: epochTime, dateDeFin: epochTime, libelle, plafond: 0 }
}

function ventilationDetailleeAttendue(
  label: string,
  montant: number,
  pourcentageConsomme: number
): Extract<FinancementsViewModel, { vue: 'detaillee' }>['ventilationFne'][number] {
  const couleur = obtenirCouleurEnveloppe(label)
  return {
    color: couleur,
    couleurGraphique: obtenirCouleurGraphique(couleur),
    label,
    pourcentageConsomme,
    total: formatMontant(montant),
  }
}

function ventilationSimpleAttendue(
  label: string,
  montant: number
): Extract<FinancementsViewModel, { vue: 'simple' }>['ventilation'][number] {
  const couleur = obtenirCouleurEnveloppe(label)
  return {
    color: couleur,
    couleurGraphique: obtenirCouleurGraphique(couleur),
    label,
    montant,
    total: formatMontant(montant),
  }
}
