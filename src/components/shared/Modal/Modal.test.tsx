import { fireEvent, render, screen, within } from '@testing-library/react'

import Modal from './Modal'

describe('modal', () => {
  it('quand j’appelle la modale alors j’affiche le bouton fermer et son contenu', () => {
    // WHEN
    render(
      <Modal
        close={vi.fn()}
        id="modaleId"
        isOpen={true}
        labelId="labelId"
      >
        contenu
      </Modal>
    )

    // THEN
    const modale = screen.getByRole('dialog')
    expect(modale).toHaveAttribute('aria-labelledby', 'labelId')
    expect(modale).toHaveAttribute('aria-modal', 'true')
    expect(modale).toHaveAttribute('id', 'modaleId')
    expect(modale).toHaveAttribute('open')
    const boutonFermer = within(modale).getByRole('button', { name: 'Fermer' })
    expect(boutonFermer).toHaveAttribute('aria-controls', 'modaleId')
    expect(boutonFermer).toHaveAttribute('type', 'button')
    const contenu = screen.getByText('contenu')
    expect(contenu).toBeInTheDocument()
  })

  it('étant donné la modale ouverte quand je clique sur le bouton fermer alors la modale se ferme', () => {
    // GIVEN
    const setIsOpen = vi.fn()
    render(
      <Modal
        close={setIsOpen}
        id="modaleId"
        isOpen={true}
        labelId="labelId"
      >
        contenu
      </Modal>
    )
    const modale = screen.getByRole('dialog')
    const boutonFermer = within(modale).getByRole('button', { name: 'Fermer' })

    // WHEN
    fireEvent.click(boutonFermer)

    // THEN
    expect(setIsOpen).toHaveBeenCalledOnce()
  })
})
