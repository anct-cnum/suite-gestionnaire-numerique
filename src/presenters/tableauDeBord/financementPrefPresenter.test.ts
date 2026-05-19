import { describe, expect, it } from 'vitest'

import { financementsPrefPresenter } from './financementPrefPresenter'
import { obtenirCouleurEnveloppe, obtenirCouleurGraphique } from '../shared/enveloppe'
import { formatMontant } from '../shared/number'
import { TableauDeBordLoaderFinancements } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

describe('financements pref presenter', () => {
  it('quand le read model est valide alors il expose les financements FNE engagés et Conseiller Numérique versés', () => {
    // GIVEN
    const readModel: TableauDeBordLoaderFinancements = {
      budgetGlobalRenseigne: '1500000',
      conseillerNumerique: {
        conventionne: '800000',
        verse: '600000',
      },
      fneEngage: '450000',
      nombreDeFinancementsEngagesParLEtat: 3,
      ventilationSubventionsParEnveloppe: [
        {
          enveloppeTotale: '1000000',
          label: 'Ingénierie France Numérique Ensemble - 2024 - État',
          total: '450000',
        },
      ],
    }

    // WHEN
    const viewModel = financementsPrefPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      budgetGlobalRenseigne: formatMontant(1_500_000),
      conseillerNumerique: {
        conventionne: formatMontant(800_000),
        verse: formatMontant(600_000),
      },
      fneEngage: formatMontant(450_000),
      nombreDeFinancementsEngagesParLEtat: 3,
      ventilationSubventionsParEnveloppe: [
        {
          color: obtenirCouleurEnveloppe('Ingénierie France Numérique Ensemble - 2024 - État'),
          couleurGraphique: obtenirCouleurGraphique(
            obtenirCouleurEnveloppe('Ingénierie France Numérique Ensemble - 2024 - État')
          ),
          label: 'Ingénierie France Numérique Ensemble - 2024 - État',
          pourcentageConsomme: 45,
          total: formatMontant(450_000),
        },
      ],
    })
  })

  it('quand une enveloppe a un total nul alors le pourcentage consommé est zéro', () => {
    // GIVEN
    const readModel: TableauDeBordLoaderFinancements = {
      budgetGlobalRenseigne: '0',
      conseillerNumerique: {
        conventionne: '0',
        verse: '0',
      },
      fneEngage: '0',
      nombreDeFinancementsEngagesParLEtat: 0,
      ventilationSubventionsParEnveloppe: [
        {
          enveloppeTotale: '0',
          label: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
          total: '0',
        },
      ],
    }

    // WHEN
    const viewModel = financementsPrefPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      budgetGlobalRenseigne: formatMontant(0),
      conseillerNumerique: {
        conventionne: formatMontant(0),
        verse: formatMontant(0),
      },
      fneEngage: formatMontant(0),
      nombreDeFinancementsEngagesParLEtat: 0,
      ventilationSubventionsParEnveloppe: [
        {
          color: obtenirCouleurEnveloppe('Formation Aidant Numérique/Aidants Connect - 2024 - État'),
          couleurGraphique: obtenirCouleurGraphique(
            obtenirCouleurEnveloppe('Formation Aidant Numérique/Aidants Connect - 2024 - État')
          ),
          label: 'Formation Aidant Numérique/Aidants Connect - 2024 - État',
          pourcentageConsomme: 0,
          total: formatMontant(0),
        },
      ],
    })
  })

  it('quand le read model est en erreur alors il retourne le view model d’erreur', () => {
    // GIVEN
    const readModel: ErrorReadModel = {
      message: 'Impossible de récupérer les données de financement',
      type: 'error',
    }

    // WHEN
    const viewModel = financementsPrefPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      message: 'Impossible de récupérer les données de financement',
      type: 'error',
    })
  })
})
