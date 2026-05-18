import { describe, expect, it } from 'vitest'

import { financementAdminPresenter } from './financementAdminPresenter'
import { obtenirCouleurEnveloppe } from '../shared/enveloppe'
import { formatMontantEnMillions } from '../shared/number'
import { TableauDeBordLoaderFinancementsAdmin } from '@/use-cases/queries/RecuperFinancements'
import { ErrorReadModel } from '@/use-cases/queries/shared/ErrorReadModel'

describe('financement admin presenter', () => {
  it('quand le read model est valide alors il expose le FNE engagé/disponible et le Conseiller Numérique versé/conventionné en millions', () => {
    // GIVEN
    const readModel: TableauDeBordLoaderFinancementsAdmin = {
      conseillerNumerique: {
        conventionne: '12000000',
        verse: '9000000',
      },
      fneDisponible: '5000000',
      fneEngage: '3200000',
      nombreDeFinancementsEngagesParLEtat: 7,
      ventilationSubventionsParEnveloppe: [
        {
          enveloppeTotale: '5000000',
          label: 'Ingénierie France Numérique Ensemble - 2024 - État',
          total: '3200000',
        },
      ],
    }

    // WHEN
    const viewModel = financementAdminPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      conseillerNumerique: {
        conventionne: formatMontantEnMillions(12_000_000),
        verse: formatMontantEnMillions(9_000_000),
      },
      fneDisponible: formatMontantEnMillions(5_000_000),
      fneEngage: formatMontantEnMillions(3_200_000),
      nombreDeFinancementsEngagesParLEtat: 7,
      ventilationSubventionsParEnveloppe: [
        {
          color: obtenirCouleurEnveloppe('Ingénierie France Numérique Ensemble - 2024 - État'),
          label: 'Ingénierie France Numérique Ensemble - 2024 - État',
          pourcentageConsomme: 64,
          total: formatMontantEnMillions(3_200_000),
        },
      ],
    })
  })

  it('quand le read model est en erreur alors il retourne le view model d’erreur', () => {
    // GIVEN
    const readModel: ErrorReadModel = {
      message: 'Impossible de récupérer les données de financement admin',
      type: 'error',
    }

    // WHEN
    const viewModel = financementAdminPresenter(readModel)

    // THEN
    expect(viewModel).toStrictEqual({
      message: 'Impossible de récupérer les données de financement admin',
      type: 'error',
    })
  })
})
