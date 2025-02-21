import { render, screen } from '@testing-library/react'

import FeuilleDeRoute from './FeuilleDeRoute'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'

describe('feuille de route', () => {
  it('quand je consulte la page du détail d’une feuille de route, alors j’accède à ses informations détaillées', () => {
    // GIVEN
    const viewModel = feuilleDeRoutePresenter('62')

    // WHEN
    render(<FeuilleDeRoute feuilleDeRouteViewModel={viewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Feuille de route 62' })
    const modifier = screen.getByRole('button', { name: 'Modifier' })
    const porteur = screen.getByRole('link', { name: 'CC des Monts du Lyonnais' })
    const perimetre = screen.getByText('Périmètre départemental')
    const resumeActions = screen.getByText('3 actions, 5 bénéficiaires, 3 co-financeurs')
    const derniereEdition = screen.getByText('Modifiée le 23/11/2024 par Lucie Brunot')

    expect(titre).toBeInTheDocument()
    expect(modifier).toBeInTheDocument()
    expect(porteur).toHaveAttribute('href', '/')
    expect(perimetre).toBeInTheDocument()
    expect(resumeActions).toBeInTheDocument()
    expect(derniereEdition).toBeInTheDocument()
  })
})
