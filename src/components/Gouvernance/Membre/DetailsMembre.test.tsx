import { fireEvent, within, screen, render } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('memebres', () => {
  it('quand je clique sur un membres, alors un drawer s’ouvre avec les détails du membres', () => {
  // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const membre = screen.getByRole('button', { name: 'Préfecture du Rhône' })
    fireEvent.click(membre)

    // THEN
    const drawer = screen.getByRole('dialog')
    expect(drawer).toHaveAttribute('aria-labelledby', 'labelMembreId')
    const titreDrawer = within(drawer).getByRole('heading', { level: 1, name: 'Préfecture du Rhône' })
    expect(titreDrawer).toBeInTheDocument()
    const boutonFermeture = screen.getByRole('button', { name: 'Fermer les détails du membre : Préfecture du Rhône' })
    expect(boutonFermeture).toBeInTheDocument()
  })
})
