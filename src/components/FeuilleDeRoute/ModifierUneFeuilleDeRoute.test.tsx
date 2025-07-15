import { fireEvent, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import FeuilleDeRoute from './FeuilleDeRoute'
import { matchWithoutMarkup, renderComponent, stubbedConceal, stubbedServerAction } from '../testHelper'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'
import { feuilleDeRouteReadModelFactory, gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('modifier une feuille de route', () => {
  describe('quand je clique sur modifier une feuille de route', () => {
    it('alors s’affiche le formulaire de modification déjà rempli', () => {
      // GIVEN
      afficherUneFeuilleDeRoute()

      // WHEN
      jOuvreLeFormulairePourModifierUneFeuilleDeRoute()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Modifier une feuille de route' })
      expect(drawer).toHaveAttribute('id', 'drawerModifierUneFeuilleDeRouteId')
      const titre = within(drawer).getByRole('heading', { level: 1, name: 'Modifier une feuille de route' })
      expect(titre).toBeInTheDocument()
      const champsObligatoires = within(drawer).getByText(matchWithoutMarkup('Les champs avec * sont obligatoires.'), { selector: 'p' })
      expect(champsObligatoires).toBeInTheDocument()

      const formulaire = within(drawer).getByRole('form', { name: 'Modifier une feuille de route' })
      expect(formulaire).toHaveAttribute('method', 'dialog')
      const nom = within(formulaire).getByRole('textbox', { name: 'Quel est le nom de la feuille de route ? *' })
      expect(nom).toBeRequired()
      expect(nom).toHaveAttribute('name', 'nom')
      expect(nom).toHaveValue('Feuille de route FNE')
      expect(nom).toHaveAttribute('type', 'text')
      const porteur = within(formulaire).getByRole('combobox', { name: 'Quel membre de la gouvernance porte la feuille de route ? *' })
      expect(porteur).toBeRequired()
      const choisir = within(porteur).getByRole('option', { name: 'Choisir' })
      expect(choisir).toBeInTheDocument()
      const membre1 = within(porteur).getByRole('option', { name: 'Croix Rouge Française' })
      expect(membre1).toBeInTheDocument()
      const membre2 = within(porteur).getByRole('option', { name: 'La Poste', selected: true })
      expect(membre2).toBeInTheDocument()

      const fieldsets = within(formulaire).getAllByRole('group')
      const perimetre = within(fieldsets[0]).getByText(matchWithoutMarkup('Quel est le périmètre géographique de la feuille de route ? *'), { selector: 'legend' })
      expect(perimetre).toBeInTheDocument()
      const regional = within(formulaire).getByRole('radio', { name: 'Régional' })
      expect(regional).toBeRequired()
      expect(regional).toHaveAttribute('value', 'regional')
      const departemental = within(formulaire).getByRole('radio', { checked: true, name: 'Départemental' })
      expect(departemental).toBeRequired()
      expect(departemental).toHaveAttribute('value', 'departemental')
      const epciGroupement = within(formulaire).getByRole('radio', { name: 'EPCI ou groupement de communes' })
      expect(epciGroupement).toBeRequired()
      expect(epciGroupement).toHaveAttribute('value', 'groupementsDeCommunes')

      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherUneFeuilleDeRoute()

      // WHEN
      jOuvreLeFormulairePourModifierUneFeuilleDeRoute()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Modifier une feuille de route' })
      const fermer = jeFermeLeFormulaire()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerModifierUneFeuilleDeRouteId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je modifie le formulaire, alors le drawer se ferme, une notification s’affiche, la feuille de route est mise à jour', async () => {
      // GIVEN
      const modifierUneFeuilleDeRouteAction = stubbedServerAction(['OK'])
      vi.stubGlobal('dsfr', stubbedConceal())
      afficherUneFeuilleDeRoute({ modifierUneFeuilleDeRouteAction, pathname: '/gouvernance/11/feuilles-de-route' })

      // WHEN
      jOuvreLeFormulairePourModifierUneFeuilleDeRoute()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Modifier une feuille de route' })
      jeTapeLeNomDeLaFeuilleDeRoute('Feuille de route du Rhône')
      jeSelectionneUnMembre('membre1FooId')
      jeSelectionneUnPerimetre('Régional')
      const enregistrer = jEnregistreLaFeuilleDeRoute()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Modification en cours...')
      expect(enregistrer).toBeDisabled()
      expect(modifierUneFeuilleDeRouteAction).toHaveBeenCalledWith({
        nom: 'Feuille de route du Rhône',
        path: '/gouvernance/11/feuilles-de-route',
        perimetre: 'regional',
        uidFeuilleDeRoute: 'feuilleDeRouteFooId',
        uidGouvernance: 'gouvernanceFooId',
        uidPorteur: 'membre1FooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Feuille de route modifiée')
      expect(drawer).not.toBeVisible()
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification s’affiche', async () => {
      // GIVEN
      const modifierUneFeuilleDeRouteAction = stubbedServerAction(['Le format est incorrect', 'autre erreur'])
      vi.stubGlobal('dsfr', stubbedConceal())
      afficherUneFeuilleDeRoute({ modifierUneFeuilleDeRouteAction })

      // WHEN
      jOuvreLeFormulairePourModifierUneFeuilleDeRoute()
      jeTapeLeNomDeLaFeuilleDeRoute('Feuille de route du Rhône')
      jeSelectionneUnMembre('membre1FooId')
      jeSelectionneUnPerimetre('Régional')
      jEnregistreLaFeuilleDeRoute()

      // THEN
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
    })
  })

  function jeTapeLeNomDeLaFeuilleDeRoute(value: string): HTMLElement {
    const input = screen.getByRole('textbox', { name: 'Quel est le nom de la feuille de route ? *' })
    fireEvent.change(input, { target: { value } })
    return input
  }

  function jeSelectionneUnMembre(value: string): void {
    fireEvent.change(screen.getByRole('combobox', { name: 'Quel membre de la gouvernance porte la feuille de route ? *' }), { target: { value } })
  }

  function jeSelectionneUnPerimetre(name: string): void {
    fireEvent.click(screen.getByRole('radio', { name }))
  }

  function jEnregistreLaFeuilleDeRoute(): HTMLElement {
    return presserLeBouton('Enregistrer')
  }

  function jeFermeLeFormulaire(): HTMLElement {
    return presserLeBouton('Fermer le formulaire de modification d’une feuille de route')
  }

  function jOuvreLeFormulairePourModifierUneFeuilleDeRoute(): void {
    presserLeBouton('Modifier', 'Modifier la feuille de route')
  }

  function presserLeBouton(name: string, description?: string): HTMLElement {
    const button = screen.getByRole('button', { description, name })
    fireEvent.click(button)
    return button
  }

  function afficherUneFeuilleDeRoute(
    options?: Partial<Parameters<typeof renderComponent>[1]>
  ): void {
    const viewModel = feuilleDeRoutePresenter(feuilleDeRouteReadModelFactory({ porteur:{
      nom: 'La Poste',
      uid: 'membre2FooId',
    },
    uid: 'feuilleDeRouteFooId' }),gouvernanceReadModelFactory({
      porteursPotentielsNouvellesFeuillesDeRouteOuActions: [
        {
          nom: 'Croix Rouge Française',
          roles: ['porteur'],
          uid: 'membre1FooId',
        },
        {
          nom: 'La Poste',
          roles: ['porteur'],
          uid: 'membre2FooId',
        },
      ],
    }))
    renderComponent(<FeuilleDeRoute viewModel={viewModel} />, options)
  }
})
