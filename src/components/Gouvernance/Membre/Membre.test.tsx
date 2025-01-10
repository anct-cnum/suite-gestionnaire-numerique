import { fireEvent, within, screen, render } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('membres', () => {
  it('quand je clique sur un membre, alors un drawer s’ouvre avec les détails du membre', () => {
    // GIVEN
    afficherGouvernance()

    // WHEN
    jOuvreLesDetailsDUnMembre()

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Préfecture du Rhône' })
    expect(drawer).toHaveAttribute('aria-labelledby', 'labelMembreId')
    const titreDrawer = within(drawer).getByRole('heading', { level: 1, name: 'Préfecture du Rhône' })
    expect(titreDrawer).toBeInTheDocument()
    const boutonFermeture = screen.getByRole('button', { name: 'Fermer les détails du membre : Préfecture du Rhône' })
    expect(boutonFermeture).toBeInTheDocument()
  })

  it('quand je clique sur un membre puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherGouvernance()

    // WHEN
    jOuvreLesDetailsDUnMembre()
    jeFermeLesDetailsDUnMembre()

    // THEN
    const drawer = screen.queryByRole('dialog', { name: 'Préfecture du Rhône' })
    expect(drawer).not.toBeInTheDocument()
  })

  function afficherGouvernance(): void {
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory())
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)
  }

  function jOuvreLesDetailsDUnMembre(): void {
    fireEvent.click(screen.getByRole('button', { name: 'Préfecture du Rhône' }))
  }

  function jeFermeLesDetailsDUnMembre(): void {
    fireEvent.click(screen.getByRole('button', { name: 'Fermer les détails du membre : Préfecture du Rhône' }))
  }
})
