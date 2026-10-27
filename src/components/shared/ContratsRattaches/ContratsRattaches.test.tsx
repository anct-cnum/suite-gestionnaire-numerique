import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ContratsRattaches, { type ContratRattacheViewModel } from './ContratsRattaches'

describe('contrats rattachés', () => {
  it('affiche l’info explicative avec le lien vers le tableau de pilotage quand il y a un contrat', () => {
    // GIVEN
    const contrats = [contrat]

    // WHEN
    render(<ContratsRattaches contrats={contrats} titre="Contrats" />)

    // THEN
    expect(screen.getByText(/Un contrat est considéré comme en cours/)).toBeInTheDocument()
    const lien = screen.getByRole('link', { name: /tableau de pilotage/ })
    expect(lien.getAttribute('href')).toBe('https://pilotage.conseiller-numerique.gouv.fr/')
  })
})

const contrat: ContratRattacheViewModel = {
  contrat: 'CDD',
  dateDebut: '07/07/2024',
  dateFin: '30/06/2026',
  dateRupture: '-',
  mediateur: 'Martin Tartempion',
  role: 'Médiateur',
  statut: { libelle: 'En cours', variant: 'success' },
}
