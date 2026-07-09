import { describe, expect, it } from 'vitest'

import { structureHistoriquePresenter } from './structureHistoriquePresenter'
import { StructureHistoriqueReadModel } from '@/use-cases/queries/RecupererStructureHistorique'

describe('structure historique presenter', () => {
  it('devrait transformer les événements avec détails et source lisible', () => {
    // GIVEN
    const readModel = createReadModel({
      evenements: [
        {
          date: new Date('2025-03-15'),
          description: 'Ingest Aidants Connect (delta)',
          details: [
            { label: 'nom', statut: 'suppression' as const, valeur: 'Ancienne dénomination' },
            { label: 'nom', statut: 'ajout' as const, valeur: 'Nouvelle dénomination' },
          ],
          source: 'aidants-connect',
          type: 'ingest delta',
        },
      ],
    })

    // WHEN
    const viewModel = structureHistoriquePresenter(readModel)

    // THEN
    expect(viewModel.denomination).toBe('Structure test')
    expect(viewModel.evenements).toHaveLength(1)
    expect(viewModel.evenements[0].date).toBe('15/03/2025')
    expect(viewModel.evenements[0].source).toBe('Aidants Connect')
    expect(viewModel.evenements[0].couleur).toBe('orange-terre-battue')
    expect(viewModel.evenements[0].details).toHaveLength(2)
    expect(viewModel.evenements[0].details[1]).toStrictEqual({
      label: 'nom',
      statut: 'ajout',
      valeur: 'Nouvelle dénomination',
    })
  })

  it('devrait transformer les pivots avec libellés sources', () => {
    // GIVEN
    const readModel = createReadModel({
      sourcesPivots: [
        { pivot: 'uuid-coop', source: 'coop' },
        { pivot: 'uuid-ac', source: 'aidants-connect' },
        { pivot: '1234', source: 'id-poste' },
      ],
    })

    // WHEN
    const viewModel = structureHistoriquePresenter(readModel)

    // THEN
    expect(viewModel.sourcesPivots).toHaveLength(3)
    expect(viewModel.sourcesPivots[0].libelleSource).toBe('Coop médiation numérique')
    expect(viewModel.sourcesPivots[1].libelleSource).toBe('Aidants Connect')
    expect(viewModel.sourcesPivots[2].libelleSource).toBe('id-poste (CoNum)')
  })

  it('devrait gérer un historique vide', () => {
    // GIVEN
    const readModel = createReadModel({})

    // WHEN
    const viewModel = structureHistoriquePresenter(readModel)

    // THEN
    expect(viewModel.evenements).toHaveLength(0)
    expect(viewModel.sourcesPivots).toHaveLength(0)
  })
})

function createReadModel(overrides: Partial<StructureHistoriqueReadModel>): StructureHistoriqueReadModel {
  return {
    denomination: 'Structure test',
    evenements: [],
    sourcesPivots: [],
    ...overrides,
  }
}
