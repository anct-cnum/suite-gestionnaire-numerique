import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import DoublonsProfessionnels from './DoublonsProfessionnels'
import { DoublonsProfessionnelsViewModel } from '@/presenters/doublonsProfessionnelsPresenter'

describe('doublons professionnels', () => {
  it('quand j’affiche la page avec des doublons, alors je vois le total, une table par source et les lignes de doublons', () => {
    // GIVEN
    const viewModel: DoublonsProfessionnelsViewModel = {
      sections: [
        {
          doublons: [
            {
              idsPersonne: '1 / 2',
              idsSource: 'ac-1 / ac-2',
              nomComplet: 'Marie Dupont',
              structure: 'COMMUNE DE TEST',
            },
          ],
          libelle: 'Aidants Connect',
          source: 'aidants-connect',
        },
      ],
      total: 1,
    }

    // WHEN
    render(<DoublonsProfessionnels viewModel={viewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1 })
    expect(titre.textContent).toBe('Doublons de professionnels intra-source (1)')
    const table = screen.getByRole('table', { name: 'Aidants Connect (1)' })
    const ligne = within(table).getAllByRole('row')[1]
    const cellules = within(ligne).getAllByRole('cell')
    expect(cellules[0].textContent).toBe('Marie Dupont')
    expect(cellules[1].textContent).toBe('COMMUNE DE TEST')
    expect(cellules[2].textContent).toBe('1 / 2')
    expect(cellules[3].textContent).toBe('ac-1 / ac-2')
  })

  it('quand j’affiche la page sans doublon, alors un message le dit et aucune table n’est rendue', () => {
    // GIVEN
    const viewModel: DoublonsProfessionnelsViewModel = {
      sections: [],
      total: 0,
    }

    // WHEN
    render(<DoublonsProfessionnels viewModel={viewModel} />)

    // THEN
    expect(screen.getByText('Aucun doublon détecté.')).toBeInTheDocument()
    expect(screen.queryByRole('table')).not.toBeInTheDocument()
  })
})
