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
    const ajouterUneNoteDeContexte = screen.getByRole('button', { name: 'Ajouter une note de contexte' })
    fireEvent.click(ajouterUneNoteDeContexte)

    // THEN
    const drawer = screen.getByRole('dialog', { name: 'Note de contexte' })
    expect(drawer).toBeInTheDocument()
    const texteDInstructions = within(drawer).getByText('Précisez, au sein d‘une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance')
    expect(texteDInstructions).toBeInTheDocument()
    const boutonsEdition = [
      'Titre 1',
      'Titre 2',
      'Titre 3',
      'Gras',
      'Italique',
      'Liste ordonnée',
      'Liste non ordonnée',
    ]
    boutonsEdition.forEach((title) => {
      expect(within(drawer).getByRole('button', { name: title })).toBeInTheDocument()
    })
    const formulaire = within(drawer).getByRole('form', {
      name: "Formulaire d'ajout de note de contexte",
    })
    expect(formulaire).toBeInTheDocument()
    const champDeTexte = within(formulaire).getByRole('textarea')
    expect(champDeTexte.innerHTML).toBe('<p>Hello World! 🌎️</p>')
    const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeInTheDocument()
  })
})
