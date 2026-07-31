import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MaStructureNonIdentifiee from './MaStructureNonIdentifiee'

describe('ma structure non identifiée', () => {
  it("étant un gestionnaire de département sans structure identifiée, quand j'affiche la page, alors le message d'explication s'affiche avec mon département et le contact du support", () => {
    // WHEN
    render(<MaStructureNonIdentifiee departement="Calvados (14)" />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Ma structure' })
    expect(titre).toBeInTheDocument()

    const alerte = screen.getByRole('heading', { level: 3, name: 'Votre structure n’a pas encore été identifiée' })
    expect(alerte).toBeInTheDocument()

    const message = screen.getByText(/votre structure pour le département Calvados \(14\) n’a pas été identifiée/)
    expect(message).toBeInTheDocument()
    expect(screen.getByText(/cela va venir d’ici peu/)).toBeInTheDocument()
    expect(screen.getByText(/pour connaître l’état d’avancement/)).toBeInTheDocument()

    const lienSupport = screen.getByRole('link', { name: 'moninclusionnumerique@anct.gouv.fr' })
    expect(lienSupport).toHaveAttribute('href', 'mailto:moninclusionnumerique@anct.gouv.fr')
  })
})
