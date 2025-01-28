/* eslint-disable id-length */
import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { vi } from 'vitest'

import Gouvernance from '../Gouvernance'
import { presserLeBouton, renderComponent } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

const now = new Date('2024-09-06')

const mockRichTextEditor = {
  contenu: '',
  gererLeChangementDeContenu: vi.fn().mockImplementation((content: string): void => {
    mockRichTextEditor.contenu = content
  }),
  viderLeContenu: vi.fn(),
}

vi.mock('@/components/shared/RichTextEditor/hooks/useRichTextEditor', () => ({
  useRichTextEditor: (): typeof mockRichTextEditor => mockRichTextEditor,
}))

describe('note de contexte', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    vi.resetModules()
    mockRichTextEditor.contenu = ''
  })
  it('quand j‘affiche une gouvernance sans note de contexte, lorsque je clique sur le bouton pour ajouter une note de contexte, alors le drawer pour ajouter une note de contexte s‘ouvre', () => {
    // GIVEN
    afficherUneGouvernance()

    // WHEN
    jOuvreLeFormulairePourAjouterUneNoteDeContexte()

    // THEN
    expect(ajouterUneNoteDeContextDrawer()).toHaveAttribute('aria-labelledby', 'labelAjouterNoteDeContexteId')
    expect(ajouterUneNoteDeContextDrawer()).toHaveAttribute('id', 'drawerAjouterNoteDeContexteId')
    expect(ajouterUneNoteDeContextDrawer()).toHaveAttribute('open')
    const formulaire = within(ajouterUneNoteDeContextDrawer()).getByRole('form', { name: 'Note de contexte' })
    const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Note de contexte' })
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

  it('quand je clique sur le bouton enregistrer le drawer se ferme et une notification s‘affiche', async () => {
    // GIVEN
    const ajouterUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['OK']))
    afficherUneGouvernance({ ajouterUneNoteDeContexteAction, pathname: '/gouvernance/11' })
    jOuvreLeFormulairePourAjouterUneNoteDeContexte()

    // WHEN
    jeSoumetLeFormulaireDeCreationDeNoteDeContexte()

    // THEN@
    const formulaire = within(ajouterUneNoteDeContextDrawer()).getByRole('form', { name: 'Note de contexte' })
    const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Ajout en cours...' })
    expect(boutonEnregistrer).toHaveAccessibleName('Ajout en cours...')
    expect(boutonEnregistrer).toBeDisabled()
    const ajouterUneNoteDeContexteDrawer = await screen.findByRole('dialog', { name: 'Note de contexte' })
    expect(ajouterUneNoteDeContexteDrawer).not.toBeVisible()
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Note de contexte bien ajoutée')
    expect(boutonEnregistrer).toHaveAccessibleName('Enregistrer')
  })

  it('quand je clique sur le bouton enregistrer mais qu‘une erreur intervient, alors une notification apparaît', async () => {
    // GIVEN
    const ajouterUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
    afficherUneGouvernance({ ajouterUneNoteDeContexteAction, pathname: '/gouvernance/11' })
    jOuvreLeFormulairePourAjouterUneNoteDeContexte()

    // WHEN
    jeSoumetLeFormulaireDeCreationDeNoteDeContexte()

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
  })

  it('quand je commence à écrire dans l‘éditeur de texte enrichi, les boutons enregistrer et supprimer deviennent actifs', () => {
    // GIVEN
    afficherUneGouvernance()
    mockRichTextEditor.contenu = '<p>Ma note de contexte</p>'

    // WHEN
    jOuvreLeFormulairePourAjouterUneNoteDeContexte()

    // THEN
    const boutonEnregistrer = within(ajouterUneNoteDeContextDrawer()).getByRole('button', { name: 'Enregistrer' })
    const boutonSupprimer = within(ajouterUneNoteDeContextDrawer()).getByRole('button', { name: 'Supprimer' })
    expect(boutonEnregistrer).not.toBeDisabled()
    expect(boutonSupprimer).not.toBeDisabled()
  })

  it('quand j’affiche une gouvernance avec une note de contexte, lorsque je clique sur le bouton modifier, le drawer s‘ouvre avec le contenu de la note de contexte', () => {
    // GIVEN
    afficherUneGouvernanceAvecNoteDeContexte()

    // WHEN
    jOuvreLeFormulairePourModifierUneNoteDeContexte()

    // THEN
    const drawer = modifierUneNoteDeContexteDrawer()
    const editeurDeTextEnrichi = within(drawer).getByRole('textarea')
    expect(editeurDeTextEnrichi).toBeInTheDocument()
    expect(editeurDeTextEnrichi.innerHTML).toBe('<p><strong>titre note de contexte</strong></p><p>un paragraphe avec du bold <strong>bold</strong></p>')
    const boutonEnregistrer = within(modifierUneNoteDeContexteDrawer()).getByRole('button', { name: 'Enregistrer' })
    expect(boutonEnregistrer).toBeDisabled()
    const modifierPar = within(drawer).getByText('Modifié le 06/09/2024 par Jean Deschamps')
    expect(modifierPar).toBeInTheDocument()
  })

  it('puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    afficherUneGouvernanceAvecNoteDeContexte()
    jOuvreLeFormulairePourModifierUneNoteDeContexte()
    const drawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })

    // WHEN
    jeFermeLeFormulairePourModifierUneNoteDeContexte()

    // THEN
    expect(drawer).not.toBeVisible()
  })

  it('puis lorsque je modifie le contenu de la note de contexte, les boutons enregistrer et supprimer deviennent actifs', () => {
    // GIVEN
    afficherUneGouvernanceAvecNoteDeContexte()
    mockRichTextEditor.contenu = '<p>Ma note de contexte</p>'

    // WHEN
    jOuvreLeFormulairePourModifierUneNoteDeContexte()

    // THEN
    const boutonEnregistrer = within(modifierUneNoteDeContexteDrawer()).getByRole('button', { name: 'Enregistrer' })
    const boutonSupprimer = within(modifierUneNoteDeContexteDrawer()).getByRole('button', { name: 'Supprimer' })
    expect(boutonEnregistrer).not.toBeDisabled()
    expect(boutonSupprimer).not.toBeDisabled()
  })

  it('quand je clique sur le bouton enregistrer le drawer se ferme et une notification s‘affiche', async () => {
    // GIVEN
    const modifierUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['OK']))
    afficherUneGouvernanceAvecNoteDeContexte({ modifierUneNoteDeContexteAction, pathname: '/gouvernance/11' })
    presserLeBouton('Modifier')
    const formulaire = within(modifierUneNoteDeContexteDrawer()).getByRole('form', { name: 'labelModifierNoteDeContexteId' })
    const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })

    // WHEN
    fireEvent.submit(formulaire)

    // THEN
    expect(boutonEnregistrer).toHaveAccessibleName('Modification en cours...')
    expect(boutonEnregistrer).toBeDisabled()
    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'Modifier note de contexte' })).not.toBeInTheDocument()
    })
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Note de contexte bien modifiée')
    expect(boutonEnregistrer).toHaveAccessibleName('Enregistrer')
  })

  it('quand je clique sur le bouton enregistrer mais qu‘une erreur intervient, alors une notification apparaît', async () => {
    // GIVEN
    const modifierUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
    afficherUneGouvernanceAvecNoteDeContexte({ modifierUneNoteDeContexteAction, pathname: '/gouvernance/11' })
    jOuvreLeFormulairePourModifierUneNoteDeContexte()
    const formulaire = within(modifierUneNoteDeContexteDrawer()).getByRole('form', { name: 'labelModifierNoteDeContexteId' })

    // WHEN
    fireEvent.submit(formulaire)

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
  })

  function afficherUneGouvernance(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ noteDeContexte: undefined }), now)
    renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />, options)
  }

  function afficherUneGouvernanceAvecNoteDeContexte(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      noteDeContexte: {
        dateDeModification: new Date('2024-09-06'),
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte: '<p><strong>titre note de contexte</strong></p><p>un paragraphe avec du bold <b>bold</b></p>',
      },
    }), now)
    renderComponent(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />, options)
  }

  function jOuvreLeFormulairePourAjouterUneNoteDeContexte(): void {
    presserLeBouton('Ajouter une note de contexte')
  }

  function jeSoumetLeFormulaireDeCreationDeNoteDeContexte(): HTMLElement {
    const formulaire = screen.getByRole('form', { name: 'Note de contexte' })
    fireEvent.submit(formulaire)
    return formulaire
  }

  function ajouterUneNoteDeContextDrawer(): HTMLElement {
    return screen.getByRole('dialog', { name: 'Note de contexte' })
  }

  function modifierUneNoteDeContexteDrawer(): HTMLElement {
    return screen.getByRole('dialog', { name: 'Modifier note de contexte' })
  }
})

function jeFermeLeFormulairePourModifierUneNoteDeContexte(): void {
  presserLeBouton('Fermer le formulaire de modification d’une note de contexte')
}

function jOuvreLeFormulairePourModifierUneNoteDeContexte(): void {
  presserLeBouton('Modifier')
}
