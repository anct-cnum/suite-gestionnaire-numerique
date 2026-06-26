import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import LieuInclusionHistorique from './LieuInclusionHistorique'
import { LieuHistoriqueViewModel } from '@/presenters/lieuHistoriquePresenter'

describe('lieu inclusion historique', () => {
  it('devrait afficher les événements avec leurs détails', () => {
    // GIVEN
    const viewModel = createDefaultViewModel()

    // WHEN
    render(<LieuInclusionHistorique lieuId="42" viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Ingest Coop').textContent).toBe('Ingest Coop')
    expect(screen.getByText(/nom: Maison France Services/).textContent).toContain('Maison France Services')
    expect(screen.getByText(/structure_coop_id: uuid-coop-123/).textContent).toContain('uuid-coop-123')
  })

  it('devrait afficher les pivots', () => {
    // GIVEN
    const viewModel = createDefaultViewModel()

    // WHEN
    render(<LieuInclusionHistorique lieuId="42" viewModel={viewModel} />)

    // THEN
    expect(screen.getAllByText(/uuid-coop-123/).length).toBeGreaterThanOrEqual(1)
  })

  it('devrait afficher un message quand il n y a aucun événement', () => {
    // GIVEN
    const viewModel: LieuHistoriqueViewModel = {
      evenements: [],
      nomLieu: 'Lieu vide',
      sourcesPivots: [],
    }

    // WHEN
    render(<LieuInclusionHistorique lieuId="99" viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Aucun événement enregistré pour ce lieu.').textContent).toBe(
      'Aucun événement enregistré pour ce lieu.'
    )
  })

  it('devrait afficher le lien retour', () => {
    // GIVEN
    const viewModel = createDefaultViewModel()

    // WHEN
    render(<LieuInclusionHistorique lieuId="42" viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Retour au détail du lieu').getAttribute('href')).toBe('/lieu/42')
  })
})

function createDefaultViewModel(): LieuHistoriqueViewModel {
  return {
    evenements: [
      {
        couleur: 'blue-france',
        date: '15/03/2025',
        description: 'Ingest Coop',
        details: [
          { label: 'nom', statut: 'contexte' as const, valeur: 'Maison France Services' },
          { label: 'structure_coop_id', statut: 'contexte' as const, valeur: 'uuid-coop-123' },
        ],
        icone: 'information-line',
        source: 'Coop médiation numérique',
        type: 'ingest',
      },
    ],
    nomLieu: 'Maison France Services',
    sourcesPivots: [{ libelleSource: 'Coop médiation numérique', pivot: 'uuid-coop-123', source: 'coop' }],
  }
}
