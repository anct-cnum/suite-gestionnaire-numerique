import { fireEvent, screen, within } from '@testing-library/react'

import FeuilleDeRoute from './FeuilleDeRoute'
import { renderComponent, stubbedServerAction } from '../testHelper'
import { feuilleDeRouteViewModelFactory } from '@/presenters/testHelper'

describe('note de contextualisation', () => {
  it('quand j’affiche une feuille de route sans note de contextualisation, alors elle s’affiche avec un bouton pour ajouter une note de contextualisation', () => {
    // WHEN
    afficherUneFeuilleDeRouteSansNoteDeContextualisation()

    // THEN
    const sectionContextualisation = screen.getByRole('region', { name: 'Contextualisation des demandes de subvention' })
    const enTeteContextualisation = within(sectionContextualisation).getByRole('banner')
    const titreContextualisation = within(enTeteContextualisation).getByRole('heading', { level: 2, name: 'Contextualisation des demandes de subvention' })
    expect(titreContextualisation).toBeInTheDocument()
    const boutonContextualisation = within(enTeteContextualisation).getByRole('button', { description: 'Ajouter la contextualisation', name: 'Ajouter' })
    expect(boutonContextualisation).toHaveAttribute('type', 'button')
  })

  describe('quand je clique sur ajouter la contextualisation', () => {
    it('alors le formulaire de contextualisation s’affiche', () => {
      // GIVEN
      afficherUneFeuilleDeRouteSansNoteDeContextualisation()

      // WHEN
      jouvreLeDrawerDAjoutDeNoteDeContextualisation()

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Contextualisation des demandes de subvention' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterNoteDeContextualisationId')
      const formulaire = within(drawer).getByRole('form', { name: 'Contextualisation des demandes de subvention' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Contextualisation des demandes de subvention' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(formulaire).getByText('Précisez, au sein d‘une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance.', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const editeurDeTextEnrichi = within(formulaire).getByRole('textarea', { name: 'Éditeur de note de contextualisation' })
      expect(editeurDeTextEnrichi).toBeInTheDocument()
      const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(boutonEnregistrer).toHaveAttribute('type', 'submit')
      const boutonEffacer = within(formulaire).queryByRole('button', { name: 'Effacer' })
      expect(boutonEffacer).not.toBeInTheDocument()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneFeuilleDeRouteSansNoteDeContextualisation()

      // WHEN
      jouvreLeDrawerDAjoutDeNoteDeContextualisation()
      const drawer = screen.getByRole('dialog', { name: 'Contextualisation des demandes de subvention' })
      const fermer = jeFermeLeFormulairePourAjouterUneNoteDeContextualisation()

      // // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterNoteDeContextualisationId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme et une notification de succès s’affiche', async () => {
      // GIVEN
      const ajouterUneNoteDeContextualisationAction = stubbedServerAction(['OK'])
      afficherUneFeuilleDeRouteSansNoteDeContextualisation({ ajouterUneNoteDeContextualisationAction, pathname: '/gouvernance/11/feuille-de-route/116' })

      // WHEN
      jouvreLeDrawerDAjoutDeNoteDeContextualisation()
      jeTapeUneNoteDeContextualisation()
      const boutonEnregistrer = jEnregistreLaNoteDeContextualisation()

      // THEN
      expect(boutonEnregistrer).toHaveAccessibleName('Ajout en cours...')
      expect(boutonEnregistrer).toBeDisabled()
      const drawer = await screen.findByRole('dialog', { name: 'Contextualisation des demandes de subvention' })
      expect(drawer).not.toBeVisible()
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note de contextualisation ajoutée')
      expect(boutonEnregistrer).toBeEnabled()
      expect(boutonEnregistrer).toHaveAccessibleName('Enregistrer')
    })

    it('quand je clique sur le bouton enregistrer mais qu‘une erreur intervient, alors une notification apparaît', async () => {
      // GIVEN
      const ajouterUneNoteDeContextualisationAction = stubbedServerAction(['Le contenu doit être renseigné'])
      afficherUneFeuilleDeRouteSansNoteDeContextualisation({ ajouterUneNoteDeContextualisationAction, pathname: '/gouvernance/11/feuille-de-route/116' })
      jouvreLeDrawerDAjoutDeNoteDeContextualisation()

      // WHEN
      jEnregistreLaNoteDeContextualisation()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le contenu doit être renseigné')
    })
  })

  describe('quand je clique sur modifier la contextualisation', () => {
    it('alors le formulaire de contextualisation s’affiche', () => {
      // GIVEN
      afficherUneFeuilleDeRouteAvecNoteDeContextualisation()

      // WHEN
      jouvreLeDrawerDeModificationDeNoteDeContextualisation()

      // THEN
      const drawer = screen.getByRole('dialog', { name: 'Contextualisation des demandes de subvention' })
      expect(drawer).toHaveAttribute('id', 'drawerModifierNoteDeContextualisationId')
      const formulaire = within(drawer).getByRole('form', { name: 'Contextualisation des demandes de subvention' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Contextualisation des demandes de subvention' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(formulaire).getByText('Précisez, au sein d‘une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance.', { selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const editeurDeTextEnrichi = within(formulaire).getByRole('textarea', { name: 'Éditeur de note de contextualisation' })
      expect(editeurDeTextEnrichi).toBeInTheDocument()
      const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(boutonEnregistrer).toHaveAttribute('type', 'submit')
      const boutonEffacer = within(formulaire).getByRole('button', { name: 'Effacer' })
      expect(boutonEffacer).toBeInTheDocument()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme, une notification s’affiche, la gouvernance est mise à jour', async () => {
      // GIVEN
      const modifierUneNoteDeContextualisationAction = stubbedServerAction(['OK'])
      afficherUneFeuilleDeRouteAvecNoteDeContextualisation({ modifierUneNoteDeContextualisationAction, pathname: '/gouvernance/11/feuille-de-route/116' })

      // WHEN
      jouvreLeDrawerDeModificationDeNoteDeContextualisation()
      jeTapeUneNoteDeContextualisation()
      const boutonEnregistrer = jEnregistreLaNoteDeContextualisation()

      // THEN
      expect(boutonEnregistrer).toHaveAccessibleName('Modification en cours...')
      expect(boutonEnregistrer).toBeDisabled()
      const drawer = await screen.findByRole('dialog', { name: 'Contextualisation des demandes de subvention' })
      expect(drawer).not.toBeVisible()
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note de contextualisation modifiée')
      expect(boutonEnregistrer).toHaveAccessibleName('Enregistrer')
      expect(boutonEnregistrer).toBeEnabled()
    })

    it('puis que je le modifie mais qu‘une erreur intervient, alors une notification s‘affiche', async () => {
      // GIVEN
      const modifierUneNoteDeContextualisationAction = stubbedServerAction(['Le contenu doit être renseigné'])
      afficherUneFeuilleDeRouteAvecNoteDeContextualisation({ modifierUneNoteDeContextualisationAction, pathname: '/gouvernance/11/feuille-de-route/116' })

      // WHEN
      jouvreLeDrawerDeModificationDeNoteDeContextualisation()
      jEnregistreLaNoteDeContextualisation()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le contenu doit être renseigné')
    })

    it('puis que je veux effacer la note de contextualisation, alors une notification s‘affiche', async () => {
      // GIVEN
      const supprimerUneNoteDeContextualisationAction = stubbedServerAction(['OK'])
      afficherUneFeuilleDeRouteAvecNoteDeContextualisation({ pathname: '/gouvernance/11/feuille-de-route/116', supprimerUneNoteDeContextualisationAction })

      // WHEN
      jouvreLeDrawerDeModificationDeNoteDeContextualisation()
      jEffaceLaNoteDeContextualisation()
      const enregistrer = jEnregistreLaNoteDeContextualisation()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Modification en cours...')
      expect(enregistrer).toBeDisabled()
      const drawer = await screen.findByRole('dialog', { name: 'Contextualisation des demandes de subvention' })
      expect(drawer).not.toBeVisible()
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Note de contextualisation supprimée')
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je veux supprimer la note privée mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const supprimerUneNoteDeContextualisationAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      afficherUneFeuilleDeRouteAvecNoteDeContextualisation({ pathname: '/gouvernance/11/feuille-de-route/116', supprimerUneNoteDeContextualisationAction })

      // WHEN
      jouvreLeDrawerDeModificationDeNoteDeContextualisation()
      jEffaceLaNoteDeContextualisation()
      jEnregistreLaNoteDeContextualisation()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneFeuilleDeRouteAvecNoteDeContextualisation()

      // WHEN
      jouvreLeDrawerDeModificationDeNoteDeContextualisation()
      const drawer = screen.getByRole('dialog', { name: 'Contextualisation des demandes de subvention' })
      const fermer = jeFermeLeFormulairePourModifierUneNoteDeContextualisation()

      // // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerModifierNoteDeContextualisationId')
      expect(drawer).not.toBeVisible()
    })
  })
})

function afficherUneFeuilleDeRouteSansNoteDeContextualisation(
  options?: Partial<Parameters<typeof renderComponent>[1]>
): void {
  const feuilleDeRouteViewModel = feuilleDeRouteViewModelFactory('11', '113', {
    contextualisation: '',
  })
  renderComponent(<FeuilleDeRoute feuilleDeRouteViewModel={feuilleDeRouteViewModel} />, options)
}

function afficherUneFeuilleDeRouteAvecNoteDeContextualisation(
  options?: Partial<Parameters<typeof renderComponent>[1]>
): void {
  const feuilleDeRouteViewModel = feuilleDeRouteViewModelFactory('11', '113', {
    contextualisation: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
  })
  renderComponent(<FeuilleDeRoute feuilleDeRouteViewModel={feuilleDeRouteViewModel} />, options)
}

function jouvreLeDrawerDAjoutDeNoteDeContextualisation(): void {
  const sectionContextualisation = screen.getByRole('region', { name: 'Contextualisation des demandes de subvention' })
  const enTeteContextualisation = within(sectionContextualisation).getByRole('banner')
  const boutonContextualisation = within(enTeteContextualisation).getByRole('button', { description: 'Ajouter la contextualisation', name: 'Ajouter' })
  fireEvent.click(boutonContextualisation)
}

function jouvreLeDrawerDeModificationDeNoteDeContextualisation(): void {
  const sectionContextualisation = screen.getByRole('region', { name: 'Contextualisation des demandes de subvention' })
  const enTeteContextualisation = within(sectionContextualisation).getByRole('banner')
  const boutonContextualisation = within(enTeteContextualisation).getByRole('button', { description: 'Modifier la contextualisation', name: 'Modifier' })
  fireEvent.click(boutonContextualisation)
}

function jeFermeLeFormulairePourAjouterUneNoteDeContextualisation(): HTMLElement {
  return presserLeBouton('Fermer le formulaire de création d‘une note de contextualisation')
}

function jeFermeLeFormulairePourModifierUneNoteDeContextualisation(): HTMLElement {
  return presserLeBouton('Fermer le formulaire de modification d‘une note de contextualisation')
}

function jeTapeUneNoteDeContextualisation(): HTMLElement {
  const editeurDeTextEnrichi = within(screen.getByRole('form', { name: 'Contextualisation des demandes de subvention' })).getByRole('textarea', { name: 'Éditeur de note de contextualisation' })
  fireEvent.input(editeurDeTextEnrichi, { target: { innerHTML: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>' } })
  return editeurDeTextEnrichi
}

function jEnregistreLaNoteDeContextualisation(): HTMLElement {
  const form = screen.getByRole('form', { name: 'Contextualisation des demandes de subvention' })
  const enregistrer = within(form).getByRole('button', { name: 'Enregistrer' })
  fireEvent.click(enregistrer)
  return enregistrer
}

function jEffaceLaNoteDeContextualisation(): HTMLElement {
  const form = screen.getByRole('form', { name: 'Contextualisation des demandes de subvention' })
  const effacer = within(form).getByRole('button', { name: 'Effacer' })
  fireEvent.click(effacer)
  return effacer
}

function presserLeBouton(name: string): HTMLElement {
  const button = screen.getByRole('button', { name })
  fireEvent.click(button)
  return button
}
