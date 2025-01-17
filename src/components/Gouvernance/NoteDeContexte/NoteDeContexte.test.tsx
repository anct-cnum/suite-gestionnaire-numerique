import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { JSX } from 'react'
import { vi } from 'vitest'

import Gouvernance from '../Gouvernance'
import { renderComponent, stubbedConceal } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

const emptyContent = '<p><br class="ProseMirror-trailingBreak"></p>'

const mockEditor = {
  getHTML: vi.fn().mockReturnValue(emptyContent),
  isActive: vi.fn(() => false),
  onUpdate: vi.fn(),
  setContent: vi.fn(),
}

vi.mock('@tiptap/react', () => ({
  EditorContent: (): JSX.Element => (
    <div
      aria-label="Éditeur de note de contexte"
      contentEditable="true"
      // eslint-disable-next-line jsx-a11y/aria-role
      role="textarea"
    />
  ),
  useEditor: (): Record<string, unknown> => mockEditor,
}))

describe('note de contexte', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockEditor.getHTML.mockReturnValue(emptyContent)
  })

  it('quand j‘affiche une gouvernance sans note de contexte, lorsque je clique sur le bouton pour ajouter une note de contexte, alors le drawer pour ajouter une note de contexte s‘ouvre', () => {
    // GIVEN
    afficherUneGouvernance()

    // WHEN
    jeCliquerSurAjouterUneNoteDeContexte()

    // THEN
    expect(ajouterUneNoteDeContextDrawer()).toHaveAttribute('aria-labelledby', 'drawer-ajouter-note-de-contexte-titre')
    expect(ajouterUneNoteDeContextDrawer()).toHaveAttribute('aria-modal', 'true')
    expect(ajouterUneNoteDeContextDrawer()).toHaveAttribute('id', 'drawer-ajouter-note-de-contexte')
    expect(ajouterUneNoteDeContextDrawer()).toHaveAttribute('open')
    const formulaire = within(ajouterUneNoteDeContextDrawer()).getByRole('form', { name: 'Ajouter une note de contexte' })
    const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Ajouter une note de contexte' })
    expect(titre).toBeInTheDocument()
    const texteDInstructions = within(ajouterUneNoteDeContextDrawer()).getByText('Précisez, au sein d‘une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance')
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
      expect(within(ajouterUneNoteDeContextDrawer()).getByRole('button', { name: title })).toBeInTheDocument()
    })
    const editeurDeTextEnrichi = within(formulaire).getByRole('textarea')
    expect(editeurDeTextEnrichi).toHaveAttribute('aria-label', 'Éditeur de note de contexte')
    const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeDisabled()
  })

  it('quand je clique sur le bouton enregistrer le drawer se ferme et une notification s‘affiche',async () => {
    // GIVEN
    vi.stubGlobal('dsfr', stubbedConceal())
    let onUpdateCallback: (params: { editor: unknown }) => void = vi.fn()
    const mockEditorWithCallback = {
      ...mockEditor,
      onUpdate: (callback: (params: { editor: unknown }) => void): void => {
        onUpdateCallback = callback
      },
    }
    afficherUneGouvernance()

    // WHEN
    jeCliquerSurAjouterUneNoteDeContexte()
    jEcrisUneNoteDeContext(onUpdateCallback, mockEditorWithCallback)
    const formulaire = within(ajouterUneNoteDeContextDrawer()).getByRole('form', { name: 'Ajouter une note de contexte' })
    jeSoumetLeFormulaireDeCreationDeNoteDeContexte()

    // THEN
    const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Ajout en cours...' })
    expect(boutonEnregistrer).toHaveAccessibleName('Ajout en cours...')
    expect(boutonEnregistrer).toBeDisabled()
    await waitFor(async () => {
      const ajouterUneNoteDeContexte = await screen.findByRole('dialog', { name: 'Ajouter une note de contexte' })
      expect(ajouterUneNoteDeContexte).not.toBeVisible()
    })
    const notification = await screen.findByRole('alert')
    expect(notification).toBeInTheDocument()
  })
})

function jeCliquerSurAjouterUneNoteDeContexte(): void {
  const ajouterUneNoteDeContexte = screen.getByRole('button', { name: 'Ajouter une note de contexte' })
  fireEvent.click(ajouterUneNoteDeContexte)
}

function afficherUneGouvernance(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
  const gouvernanceViewModel = gouvernancePresenter(
    gouvernanceReadModelFactory({ departement: 'Rhône', noteDeContexte: undefined })
  )
  renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />, options)
}

function jEcrisUneNoteDeContext(onUpdateCallback: (
  arg: { editor: unknown }) => void, mockEditorWithCallback: unknown): void {
  mockEditor.getHTML.mockReturnValue('<p>Ma note de contexte</p>')
  onUpdateCallback({ editor: mockEditorWithCallback })
}

function jeSoumetLeFormulaireDeCreationDeNoteDeContexte(): HTMLElement {
  const formulaire = screen.getByRole('form', { name: 'Ajouter une note de contexte' })
  fireEvent.submit(formulaire)
  return formulaire
}

function ajouterUneNoteDeContextDrawer(): HTMLElement {
  return screen.getByRole('dialog', { name: 'Ajouter une note de contexte' })
}
