import { fireEvent, render, screen, within } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('note de contexte', () => {
  it('quand j’affiche une gouvernance sans note de contexte, lorsque je clique sur le bouton pour ajouter une note de contexte, alors le drawer pour ajouter une note de contexte s’ouvre', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ departement: 'Rhône', noteDeContexte: undefined }))
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    cliquerSurAjouterUneNoteDeContexte()

    // THEN
    const ajouterUneNoteDeContextDrawer = screen.getByRole('dialog', { name: 'Ajouter une note de contexte' })
    expect(ajouterUneNoteDeContextDrawer).toHaveAttribute('aria-labelledby', 'drawer-ajouter-note-de-contexte-titre')
    expect(ajouterUneNoteDeContextDrawer).toHaveAttribute('aria-modal', 'true')
    expect(ajouterUneNoteDeContextDrawer).toHaveAttribute('id', 'drawer-ajouter-note-de-contexte')
    expect(ajouterUneNoteDeContextDrawer).toHaveAttribute('open')
    const formulaire = within(ajouterUneNoteDeContextDrawer).getByRole('form', {
      name: 'Ajouter une note de contexte',
    })
    const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Ajouter une note de contexte' })
    expect(titre).toBeInTheDocument()
    const texteDInstructions = within(ajouterUneNoteDeContextDrawer).getByText('Précisez, au sein d‘une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance')
    expect(texteDInstructions).toBeInTheDocument()
    const boutonsEdition = [
      'Titre 1',
      'Titre 2',
      'Titre 3',
      'Gras',
      'Italique',
      'Liste ordonnée',
      'Liste non ordonnée',
      'Ajouter un lien',
    ]
    boutonsEdition.forEach((title) => {
      expect(within(ajouterUneNoteDeContextDrawer).getByRole('button', { name: title })).toBeInTheDocument()
    })
    const editeurDeTextEnrichi = within(formulaire).getByRole('textarea')
    expect(editeurDeTextEnrichi.innerHTML).toBe('<p><br class="ProseMirror-trailingBreak"></p>')
    const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeDisabled()
  })
})

function cliquerSurAjouterUneNoteDeContexte(): void {
  const ajouterUneNoteDeContexte = screen.getByRole('button', { name: 'Ajouter une note de contexte' })
  fireEvent.click(ajouterUneNoteDeContexte)
}
