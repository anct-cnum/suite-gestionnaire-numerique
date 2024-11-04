import { fireEvent, render, screen, within } from '@testing-library/react'

import Drawer from './Drawer'

describe('drawer', () => {
  it('quand j’appelle le drawer alors j’affiche le bouton fermer et son contenu', () => {
    // WHEN
    render(
      <Drawer
        boutonFermeture="Fermer le menu"
        id="drawerId"
        isFixedWidth={true}
        isOpen={true}
        labelId="labelId"
        setIsOpen={vi.fn()}
      >
        contenu
      </Drawer>
    )

    // THEN
    const drawer = screen.getByRole('dialog')
    expect(drawer).toHaveAttribute('aria-labelledby', 'labelId')
    expect(drawer).toHaveAttribute('aria-modal', 'true')
    expect(drawer).toHaveAttribute('id', 'drawerId')
    expect(drawer).toHaveAttribute('open')
    const boutonFermer = within(drawer).getByRole('button', { name: 'Fermer le menu' })
    expect(boutonFermer).toHaveAttribute('aria-controls', 'drawerId')
    expect(boutonFermer).toHaveAttribute('title', 'Fermer le menu')
    expect(boutonFermer).toHaveAttribute('type', 'button')
    const children = screen.getByText('contenu')
    expect(children).toBeInTheDocument()
  })

  it('quand je clique sur le bouton fermer alors la modale se ferme', () => {
    // GIVEN
    const setIsOpen = vi.fn()
    render(
      <Drawer
        boutonFermeture="Fermer le menu"
        id="drawerId"
        isFixedWidth={true}
        isOpen={true}
        labelId="labelId"
        setIsOpen={setIsOpen}
      >
        contenu
      </Drawer>
    )
    const drawer = screen.getByRole('dialog')
    const boutonFermer = within(drawer).getByRole('button', { name: 'Fermer le menu' })

    // WHEN
    fireEvent.click(boutonFermer)

    // THEN
    expect(setIsOpen).toHaveBeenCalledWith(false)
  })
})
