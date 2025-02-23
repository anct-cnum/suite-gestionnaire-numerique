import { fireEvent, screen, waitFor, within } from '@testing-library/react'

import Gouvernance from '../Gouvernance'
import { presserLeBouton, presserLeBoutonDans, renderComponent } from '@/components/testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('note de contexte', () => {
  describe('quand je clique sur ajouter une note de contexte', () => {
    it('quand j‘affiche une gouvernance sans note de contexte, lorsque je clique sur le bouton pour ajouter une note de contexte, alors le drawer pour ajouter une note de contexte s‘ouvre', () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourAjouterUneNoteDeContexte()

      // THEN
      const drawer = ajouterUneNoteDeContextDrawer()
      expect(drawer).toHaveAttribute('id', 'drawerAjouterNoteDeContexteId')
      expect(drawer).toHaveAttribute('open')
      const formulaire = within(drawer).getByRole('form', { name: 'Note de contexte' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Note de contexte' })
      expect(titre).toBeInTheDocument()
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
        'Ajouter un lien',
      ]
      boutonsEdition.forEach((title) => {
        expect(within(drawer).getByRole('button', { name: title })).toBeInTheDocument()
      })
      const editeurDeTextEnrichi = within(formulaire).getByRole('textarea', { name: 'Éditeur de note de contexte' })
      expect(editeurDeTextEnrichi).toBeInTheDocument()
      const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(boutonEnregistrer).toBeDisabled()
      const boutonSupprimer = within(formulaire).queryByRole('button', { name: 'Supprimer' })
      expect(boutonSupprimer).not.toBeInTheDocument()
    })

    it('puis que je tape du texte dans l‘éditeur de texte enrichi, alors le bouton enregistrer et le bouton supprimer deviennent actifs', async () => {
      // GIVEN
      afficherUneGouvernance()

      // WHEN
      jOuvreLeFormulairePourAjouterUneNoteDeContexte()
      const drawer = ajouterUneNoteDeContextDrawer()
      jeTapeUneNoteDeContexte()

      // THEN
      const boutonEnregistrer = await within(drawer).findByRole('button', { name: 'Enregistrer' })
      expect(boutonEnregistrer).toBeEnabled()
      const boutonSupprimer = within(drawer).getByRole('button', { name: 'Supprimer' })
      expect(boutonSupprimer).toBeEnabled()
    })

    it('quand je clique sur le bouton enregistrer le drawer se ferme et une notification s‘affiche', async () => {
      // GIVEN
      const ajouterUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['OK']))
      afficherUneGouvernance({ ajouterUneNoteDeContexteAction, pathname: '/gouvernance/11' })
      jOuvreLeFormulairePourAjouterUneNoteDeContexte()

      // WHEN
      jEnregistreLaNoteDeContexte()

      // THEN
      const formulaire = within(ajouterUneNoteDeContextDrawer()).getByRole('form', { name: 'Note de contexte' })
      const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Ajout en cours...' })
      expect(boutonEnregistrer).toHaveAccessibleName('Ajout en cours...')
      expect(boutonEnregistrer).toBeDisabled()
      const ajouterUneNoteDeContexteDrawer = await screen.findByRole('dialog', { name: 'Note de contexte' })
      expect(ajouterUneNoteDeContexteDrawer).not.toBeVisible()
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note de contexte ajoutée')
      expect(boutonEnregistrer).toHaveAccessibleName('Enregistrer')
    })

    it('quand je clique sur le bouton enregistrer mais qu‘une erreur intervient, alors une notification apparaît', async () => {
      // GIVEN
      const ajouterUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
      afficherUneGouvernance({ ajouterUneNoteDeContexteAction, pathname: '/gouvernance/11' })
      jOuvreLeFormulairePourAjouterUneNoteDeContexte()

      // WHEN
      jEnregistreLaNoteDeContexte()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })
  })

  describe('quand je clique sur modifier', () => {
    it('le drawer s‘ouvre avec le contenu de la note de contexte', () => {
      // GIVEN
      afficherUneGouvernanceAvecNoteDeContexte()

      // WHEN
      jOuvreLeFormulairePourModifierUneNoteDeContexte()

      // THEN
      const drawer = modifierUneNoteDeContexteDrawer()
      const editeurDeTextEnrichi = within(drawer).getByRole('textarea')
      expect(editeurDeTextEnrichi).toBeInTheDocument()
      expect(editeurDeTextEnrichi.innerHTML).toBe('<p><strong>titre note de contexte</strong></p><p>un paragraphe avec du bold <strong>bold</strong></p>')
      const boutonEnregistrer = within(drawer).getByRole('button', { name: 'Enregistrer' })
      expect(boutonEnregistrer).toBeEnabled()
      const boutonEffacer = within(drawer).getByRole('button', { name: 'Effacer' })
      expect(boutonEffacer).toBeEnabled()
      const modifierPar = within(drawer).getByText('Modifié le 01/01/1970 par Jean Deschamps')
      expect(modifierPar).toBeInTheDocument()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneGouvernanceAvecNoteDeContexte()

      // WHEN
      jOuvreLeFormulairePourModifierUneNoteDeContexte()
      const drawer = ajouterUneNoteDeContextDrawer()
      const fermer = jeFermeLeFormulairePourModifierUneNoteDeContexte()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterNoteDeContexteId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme et une notification s‘affiche', async () => {
      // GIVEN
      const modifierUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['OK']))
      afficherUneGouvernanceAvecNoteDeContexte({ modifierUneNoteDeContexteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourModifierUneNoteDeContexte()
      const drawer = modifierUneNoteDeContexteDrawer()
      jeTapeUneNoteDeContexte()
      const enregistrer = jEnregistreLaNoteDeContexte()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Modification en cours...')
      expect(enregistrer).toBeDisabled()
      expect(modifierUneNoteDeContexteAction).toHaveBeenCalledWith({
        contenu: '<p><strong>titre note de contexte</strong></p><p>un paragraphe avec du bold <b>bold</b></p>',
        path: '/gouvernance/11',
        uidGouvernance: 'gouvernanceFooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note de contexte bien modifiée')
      expect(drawer).not.toBeVisible()
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je la modifie mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const modifierUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
      afficherUneGouvernanceAvecNoteDeContexte({ modifierUneNoteDeContexteAction, pathname: '/gouvernance/11' })

      // WHEN
      jOuvreLeFormulairePourModifierUneNoteDeContexte()
      jEnregistreLaNoteDeContexte()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })
  })

  it('puis que je veux supprimer la note de contexte, alors le drawer se ferme, une notification s’affiche, la gouvernance est mise à jour', async () => {
    // GIVEN
    const supprimerUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['OK']))
    afficherUneGouvernanceAvecNoteDeContexte({ pathname: '/gouvernance/11', supprimerUneNoteDeContexteAction })

    // WHEN
    jOuvreLeFormulairePourModifierUneNoteDeContexte()
    const drawer = modifierUneNoteDeContexteDrawer()
    const noteDeContexte = screen.getByRole('textarea', { name: 'Éditeur de note de contexte' })
    await waitFor(() => {
      jEffaceLaNoteDeContexte(drawer)
    })
    const enregistrer = jEnregistreLaNoteDeContexte()

    // THEN
    expect(enregistrer).toHaveAccessibleName('Modification en cours...')
    expect(enregistrer).toBeDisabled()
    expect(supprimerUneNoteDeContexteAction).toHaveBeenCalledWith({ path: '/gouvernance/11', uidGouvernance: 'gouvernanceFooId' })
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Note de contexte supprimée')
    expect(noteDeContexte).toHaveTextContent('')
    expect(drawer).not.toBeVisible()
    expect(enregistrer).toHaveAccessibleName('Enregistrer')
    expect(enregistrer).toBeEnabled()
  })

  it('puis que je veux supprimer la note de contexte mais qu’une erreur intervient, alors une notification s’affiche', async () => {
    // GIVEN
    const supprimerUneNoteDeContexteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
    afficherUneGouvernanceAvecNoteDeContexte({ pathname: '/gouvernance/11', supprimerUneNoteDeContexteAction })

    // WHEN
    jOuvreLeFormulairePourModifierUneNoteDeContexte()
    const drawer = modifierUneNoteDeContexteDrawer()
    jEffaceLaNoteDeContexte(drawer)
    jEnregistreLaNoteDeContexte()

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
  })
})

function afficherUneGouvernance(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
  const gouvernanceViewModel = gouvernancePresenter(
    gouvernanceReadModelFactory({ noteDeContexte: undefined }),
    epochTime
  )
  renderComponent(<Gouvernance />, options, gouvernanceViewModel)
}

function afficherUneGouvernanceAvecNoteDeContexte(options?: Partial<Parameters<typeof renderComponent>[1]>): void {
  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
    noteDeContexte: {
      dateDeModification: epochTime,
      nomAuteur: 'Deschamps',
      prenomAuteur: 'Jean',
      texte: '<p><strong>titre note de contexte</strong></p><p>un paragraphe avec du bold <b>bold</b></p>',
    },
  }), epochTime)
  renderComponent(<Gouvernance />, options, gouvernanceViewModel)
}

function jOuvreLeFormulairePourAjouterUneNoteDeContexte(): void {
  presserLeBouton('Ajouter une note de contexte')
}

function jeTapeUneNoteDeContexte(): HTMLElement {
  const noteDeContexte = screen.getByRole('textarea', { name: 'Éditeur de note de contexte' })
  fireEvent.input(noteDeContexte, { target: { innerHTML: '<p>Ma note de contexte</p>' } })
  return noteDeContexte
}

function jEnregistreLaNoteDeContexte(): HTMLElement {
  const formulaire = screen.getByRole('form', { name: 'Note de contexte' })
  const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
  fireEvent.submit(formulaire)
  return enregistrer
}

function ajouterUneNoteDeContextDrawer(): HTMLElement {
  return screen.getByRole('dialog', { hidden: false, name: 'Note de contexte' })
}

function modifierUneNoteDeContexteDrawer(): HTMLElement {
  return screen.getByRole('dialog', { hidden: false, name: 'Note de contexte' })
}

function jeFermeLeFormulairePourModifierUneNoteDeContexte(): HTMLElement {
  return presserLeBouton('Fermer le formulaire de modification d’une note de contexte')
}

function jOuvreLeFormulairePourModifierUneNoteDeContexte(): void {
  presserLeBouton('Modifier')
}

function jEffaceLaNoteDeContexte(context: HTMLElement): void {
  presserLeBoutonDans(context, 'Effacer')
}
