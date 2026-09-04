import { describe, expect, it } from 'vitest'

import { financementsStructurePresenter, FinancementsStructureViewModel } from './financementsStructurePresenter'
import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '../shared/enveloppe'
import { formatMontant } from '../shared/number'
import { epochTime } from '@/shared/testHelper'
import { FinancementsStructureReadModel } from '@/use-cases/queries/RecupererFinancementsStructure'
import { EnveloppeConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesEnveloppesConseillerNumerique'

describe('financements structure presenter', () => {
  it("quand il n'y a que du FNE alors le total et la ventilation ne contiennent que le FNE", () => {
    // GIVEN
    const readModel: FinancementsStructureReadModel = {
      nombreDeFinancementsEngagesParLEtat: 2,
      totalFinancements: '65100',
      ventilationSubventionsParEnveloppe: [
        { enveloppeTotale: '0', label: 'Formation Aidant Numérique/Aidants Connect - 2024 - État', total: '20000' },
        { enveloppeTotale: '0', label: 'Ingénierie France Numérique Ensemble - 2024 - État', total: '45100' },
      ],
    }

    // WHEN
    const viewModel = financementsStructurePresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      nombreDeFinancementsEngagesParLEtat: 2,
      totalFinancements: formatMontant(65100),
      ventilationSubventionsParEnveloppe: [
        ventilationAttendue('Formation Aidant Numérique/Aidants Connect - 2024 - État', 20000),
        ventilationAttendue('Ingénierie France Numérique Ensemble - 2024 - État', 45100),
      ],
    })
  })

  it("quand il n'y a que du Conum alors le total et la ventilation reprennent le Conum au lieu d'un total à 0", () => {
    // GIVEN
    const readModel: FinancementsStructureReadModel = {
      nombreDeFinancementsEngagesParLEtat: 0,
      totalFinancements: '0',
      ventilationSubventionsParEnveloppe: [],
    }
    const enveloppesConum = [
      enveloppeConum('Conseiller Numérique - Plan France Relance - État', 50000n),
      enveloppeConum('Conseiller Numérique - Renouvellement - État', 37500n),
    ]

    // WHEN
    const viewModel = financementsStructurePresenter(readModel, enveloppesConum)

    // THEN
    expect(viewModel).toStrictEqual({
      nombreDeFinancementsEngagesParLEtat: 0,
      totalFinancements: formatMontant(87500),
      ventilationSubventionsParEnveloppe: [
        ventilationAttendue('Conseiller Numérique - Plan France Relance - État', 50000),
        ventilationAttendue('Conseiller Numérique - Renouvellement - État', 37500),
      ],
    })
  })

  it('quand il y a du FNE et du Conum alors le total additionne les deux et la ventilation les liste', () => {
    // GIVEN
    const readModel: FinancementsStructureReadModel = {
      nombreDeFinancementsEngagesParLEtat: 1,
      totalFinancements: '35100',
      ventilationSubventionsParEnveloppe: [
        { enveloppeTotale: '0', label: 'Ingénierie France Numérique Ensemble - 2024 - État', total: '35100' },
      ],
    }
    const enveloppesConum = [enveloppeConum('Conseiller Numérique - Plan France Relance - État', 39999n)]

    // WHEN
    const viewModel = financementsStructurePresenter(readModel, enveloppesConum)

    // THEN
    expect(viewModel).toStrictEqual({
      nombreDeFinancementsEngagesParLEtat: 1,
      totalFinancements: formatMontant(75099),
      ventilationSubventionsParEnveloppe: [
        ventilationAttendue('Ingénierie France Numérique Ensemble - 2024 - État', 35100),
        ventilationAttendue('Conseiller Numérique - Plan France Relance - État', 39999),
      ],
    })
  })

  it('quand une enveloppe Conum est à 0 alors elle est ignorée', () => {
    // GIVEN
    const readModel: FinancementsStructureReadModel = {
      nombreDeFinancementsEngagesParLEtat: 0,
      totalFinancements: '0',
      ventilationSubventionsParEnveloppe: [],
    }
    const enveloppesConum = [
      enveloppeConum('Conseiller Numérique - Plan France Relance - État', 50000n),
      enveloppeConum('Conseiller Numérique - Renouvellement - État', 0n),
    ]

    // WHEN
    const viewModel = financementsStructurePresenter(readModel, enveloppesConum)

    // THEN
    expect(viewModel).toStrictEqual({
      nombreDeFinancementsEngagesParLEtat: 0,
      totalFinancements: formatMontant(50000),
      ventilationSubventionsParEnveloppe: [
        ventilationAttendue('Conseiller Numérique - Plan France Relance - État', 50000),
      ],
    })
  })

  it('quand le read model est en erreur alors le view model est en erreur', () => {
    // WHEN
    const viewModel = financementsStructurePresenter({ message: 'Boom', type: 'error' })

    // THEN
    expect(viewModel).toStrictEqual({ message: 'Boom', type: 'error' })
  })
})

function enveloppeConum(libelle: string, consommation: bigint): EnveloppeConseillerNumeriqueReadModel {
  return { consommation, dateDeDebut: epochTime, dateDeFin: epochTime, libelle, plafond: 0 }
}

function ventilationAttendue(
  label: string,
  montant: number
): FinancementsStructureViewModel['ventilationSubventionsParEnveloppe'][number] {
  const couleur = obtenirCouleurEnveloppe(label)
  return {
    color: couleur,
    couleurGraphique: obtenirCouleurGraphique(couleur),
    label,
    montant,
    total: formatMontant(montant),
  }
}
