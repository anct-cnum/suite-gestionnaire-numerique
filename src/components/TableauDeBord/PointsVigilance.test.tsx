import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import PointsVigilance from './PointsVigilance'
import { renderComponent } from '../testHelper'

describe('points de vigilance des lieux', () => {
  it('affiche le titre, les lignes et les boutons consulter', () => {
    // WHEN
    renderComponent(
      <PointsVigilance
        viewModel={{
          lignes: [
            {
              compteur: '120 lieux',
              pastille: '🔴',
              texte: 'à actualiser (informations de plus de 18 mois)',
              url: '/liste-lieux-inclusion?fraicheur=a-actualiser',
            },
            {
              compteur: '34 lieux',
              pastille: '🟠',
              texte: 'à vérifier (informations de 12 à 18 mois)',
              url: '/liste-lieux-inclusion?fraicheur=a-verifier',
            },
          ],
        }}
      />
    )

    // THEN
    const titre = screen.getByRole('heading', {
      level: 2,
      name: 'Points de vigilance des lieux d’inclusion numérique',
    })
    expect(titre).toBeInTheDocument()

    const lignes = screen.getAllByText(/à actualiser|à vérifier/)
    expect(lignes[0].textContent).toBe('🔴 120 lieux à actualiser (informations de plus de 18 mois)')
    expect(lignes[1].textContent).toBe('🟠 34 lieux à vérifier (informations de 12 à 18 mois)')

    const boutons = screen.getAllByRole('link', { name: 'Consulter' })
    expect(boutons).toHaveLength(2)
    expect(boutons[0]).toHaveAttribute('href', '/liste-lieux-inclusion?fraicheur=a-actualiser')
    expect(boutons[1]).toHaveAttribute('href', '/liste-lieux-inclusion?fraicheur=a-verifier')
  })
})
