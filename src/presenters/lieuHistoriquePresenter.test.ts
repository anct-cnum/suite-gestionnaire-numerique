import { describe, expect, it } from 'vitest'

import { lieuHistoriquePresenter } from './lieuHistoriquePresenter'
import { LieuHistoriqueReadModel } from '@/use-cases/queries/RecupererLieuHistorique'

describe('lieu historique presenter', () => {
  it('devrait transformer les événements avec détails et source lisible', () => {
    // GIVEN
    const readModel = createReadModel({
      evenements: [
        {
          date: new Date('2025-03-15'),
          description: 'Affectation lieu : Jean Dupont',
          details: [
            { label: 'Personne', statut: 'contexte' as const, valeur: 'Jean Dupont' },
            { label: 'Source', statut: 'contexte' as const, valeur: 'coop' },
            { label: 'Actif', statut: 'contexte' as const, valeur: 'true' },
          ],
          source: 'coop',
          type: 'affectation lieu',
        },
      ],
    })

    // WHEN
    const viewModel = lieuHistoriquePresenter(readModel)

    // THEN
    expect(viewModel.evenements).toHaveLength(1)
    expect(viewModel.evenements[0].date).toBe('15/03/2025')
    expect(viewModel.evenements[0].source).toBe('Coop médiation numérique')
    expect(viewModel.evenements[0].details).toHaveLength(3)
    expect(viewModel.evenements[0].details[0]).toStrictEqual({
      label: 'Personne',
      statut: 'contexte',
      valeur: 'Jean Dupont',
    })
  })

  it('devrait transformer les pivots avec libellés sources', () => {
    // GIVEN
    const readModel = createReadModel({
      sourcesPivots: [
        { pivot: 'uuid-coop', source: 'coop' },
        { pivot: 'carto-123', source: 'carto' },
      ],
    })

    // WHEN
    const viewModel = lieuHistoriquePresenter(readModel)

    // THEN
    expect(viewModel.sourcesPivots).toHaveLength(2)
    expect(viewModel.sourcesPivots[0].libelleSource).toBe('Coop médiation numérique')
    expect(viewModel.sourcesPivots[1].libelleSource).toBe('Cartographie nationale')
  })

  it('devrait gérer un historique vide', () => {
    // GIVEN
    const readModel = createReadModel({})

    // WHEN
    const viewModel = lieuHistoriquePresenter(readModel)

    // THEN
    expect(viewModel.evenements).toHaveLength(0)
    expect(viewModel.sourcesPivots).toHaveLength(0)
  })
})

function createReadModel(overrides: Partial<LieuHistoriqueReadModel>): LieuHistoriqueReadModel {
  return {
    evenements: [],
    nomLieu: 'Lieu test',
    sourcesPivots: [],
    ...overrides,
  }
}
