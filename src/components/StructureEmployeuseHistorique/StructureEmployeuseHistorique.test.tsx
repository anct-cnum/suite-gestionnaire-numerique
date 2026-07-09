import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import StructureEmployeuseHistorique from './StructureEmployeuseHistorique'
import { StructureHistoriqueViewModel } from '@/presenters/structureHistoriquePresenter'

describe('structure employeuse historique', () => {
  it('devrait afficher les événements avec leurs détails', () => {
    // GIVEN
    const viewModel = createDefaultViewModel()

    // WHEN
    render(<StructureEmployeuseHistorique structureId="42" viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Ingest id-poste — poste 1234 (état initial)').textContent).toBe(
      'Ingest id-poste — poste 1234 (état initial)'
    )
    expect(screen.getByText(/nom: Hub numérique/).textContent).toContain('Hub numérique')
    expect(screen.getByText(/id_structure: 5678/).textContent).toContain('5678')
  })

  it('devrait afficher les pivots', () => {
    // GIVEN
    const viewModel = createDefaultViewModel()

    // WHEN
    render(<StructureEmployeuseHistorique structureId="42" viewModel={viewModel} />)

    // THEN
    expect(screen.getAllByText(/uuid-ac-123/).length).toBeGreaterThanOrEqual(1)
  })

  it('devrait afficher un message quand il n y a aucun événement', () => {
    // GIVEN
    const viewModel: StructureHistoriqueViewModel = {
      denomination: 'Structure vide',
      evenements: [],
      sourcesPivots: [],
    }

    // WHEN
    render(<StructureEmployeuseHistorique structureId="99" viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Aucun événement enregistré pour cette structure.').textContent).toBe(
      'Aucun événement enregistré pour cette structure.'
    )
  })

  it('devrait afficher le lien retour', () => {
    // GIVEN
    const viewModel = createDefaultViewModel()

    // WHEN
    render(<StructureEmployeuseHistorique structureId="42" viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Retour au détail de la structure').getAttribute('href')).toBe('/structure/42')
  })
})

function createDefaultViewModel(): StructureHistoriqueViewModel {
  return {
    denomination: 'Hub numérique',
    evenements: [
      {
        couleur: 'green-emeraude',
        date: '15/03/2025',
        description: 'Ingest id-poste — poste 1234 (état initial)',
        details: [
          { label: 'nom', statut: 'contexte' as const, valeur: 'Hub numérique' },
          { label: 'id_structure', statut: 'contexte' as const, valeur: '5678' },
        ],
        icone: 'database-line',
        source: 'id-poste (CoNum)',
        type: 'ingest initial',
      },
    ],
    sourcesPivots: [{ libelleSource: 'Aidants Connect', pivot: 'uuid-ac-123', source: 'aidants-connect' }],
  }
}
