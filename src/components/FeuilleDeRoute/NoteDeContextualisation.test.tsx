import { fireEvent, render, screen, within } from '@testing-library/react'

import FeuilleDeRoute from './FeuilleDeRoute'
import { presserLeBouton, stubbedServerAction } from '../testHelper'
import { feuilleDeRouteViewModelFactory } from '@/presenters/testHelper'

describe('note de contextualisation', () => {
  it('quand j’affiche une feuille de route sans note de contextualisation, alors elle s’affiche avec un bouton pour ajouter une note de contextualisation', () => {
    // GIVEN
    const viewModel = feuilleDeRouteViewModelFactory('11', '113', {
      contextualisation: '',
    })

    // WHEN
    render(<FeuilleDeRoute feuilleDeRouteViewModel={viewModel} />)

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
      jouvreLeDrawerDeNoteDeContextualisation()

      // THEN
      const drawer = screen.getByRole('dialog')
      expect(drawer).toHaveAttribute('id', 'drawerAjouterNoteDeContextualisationId')
      const formulaire = within(drawer).getByRole('form', { name: 'Note de contextualisation' })
      const titre = within(formulaire).getByRole('heading', { level: 1, name: 'Contextualisation des demandes de subvention' })
      expect(titre).toBeInTheDocument()
      const sousTitre = within(formulaire).getByText('Précisez, au sein d‘une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance.',{ selector: 'p' })
      expect(sousTitre).toBeInTheDocument()
      const editeurDeTextEnrichi = within(formulaire).getByRole('textarea', { name: 'Éditeur de note de contextualisation' })
      expect(editeurDeTextEnrichi).toBeInTheDocument()
      const boutonEnregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(boutonEnregistrer).toHaveAttribute('type', 'submit')
      const boutonSupprimer = within(formulaire).queryByRole('button', { name: 'Supprimer' })
      expect(boutonSupprimer).not.toBeInTheDocument()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneFeuilleDeRouteSansNoteDeContextualisation()

      // WHEN
      jouvreLeDrawerDeNoteDeContextualisation()
      const drawer = screen.getByRole('dialog')
      const fermer = jeFermeLeFormulairePourAjouterUneNoteDeContextualisation()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterNoteDeContextualisationId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme et une notification de succès s’affiche', () => {
      // GIVEN
      const ajouterUneNoteDeContextualisationAction = stubbedServerAction(['OK'])
      afficherUneFeuilleDeRouteSansNoteDeContextualisation()

      // WHEN
      jouvreLeDrawerDeNoteDeContextualisation()
      jeTapeUneNoteDeContextualisation()
      const enregistrer = jEnregistreLaNoteDeContextualisation()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Ajout en cours...')
      expect(enregistrer).toBeDisabled()
      expect(ajouterUneNoteDeContextualisationAction).toHaveBeenCalledWith({
        contenu: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>',
        path: '/gouvernance/11/feuille-de-route/113',
      })
    })
  })
})

function afficherUneFeuilleDeRouteSansNoteDeContextualisation():void {
  const feuilleDeRouteViewModel = feuilleDeRouteViewModelFactory('11', '113', {
    contextualisation: '',
  })
  render(<FeuilleDeRoute feuilleDeRouteViewModel={feuilleDeRouteViewModel} />)
}

function jouvreLeDrawerDeNoteDeContextualisation():void {
  const sectionContextualisation = screen.getByRole('region', { name: 'Contextualisation des demandes de subvention' })
  const enTeteContextualisation = within(sectionContextualisation).getByRole('banner')
  const boutonContextualisation = within(enTeteContextualisation).getByRole('button', { description: 'Ajouter la contextualisation', name: 'Ajouter' })
  fireEvent.click(boutonContextualisation)
}

function jeFermeLeFormulairePourAjouterUneNoteDeContextualisation():HTMLElement {
  return presserLeBouton('Fermer le formulaire de création d’une note de contextualisation')
}

function jeTapeUneNoteDeContextualisation():HTMLElement {
  const editeurDeTextEnrichi = within(screen.getByRole('form', { name: 'Note de contextualisation' })).getByRole('textarea', { name: 'Éditeur de note de contextualisation' })
  fireEvent.input(editeurDeTextEnrichi, { target: { innerHTML: '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>' } })
  return editeurDeTextEnrichi
}

function jEnregistreLaNoteDeContextualisation(): HTMLElement {
  const form = screen.getByRole('form', { name: 'Note de contextualisation' })
  const enregistrer = within(form).getByRole('button', { name: 'Enregistrer' })
  fireEvent.click(enregistrer)
  return enregistrer
}
