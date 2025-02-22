import { fireEvent, screen, within } from '@testing-library/react'

import { matchWithoutMarkup, presserLeBouton, presserLeBoutonRadio, renderComponent, stubbedConceal } from '../testHelper'
import FeuillesDeRoute from './FeuillesDeRoute'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('ajouter une feuille de route', () => {
  describe('quand je clique sur ajouter une feuille de route', () => {
    it('alors s’affiche le formulaire d’ajout', () => {
      // GIVEN
      afficherLesFeuillesDeRoute()

      // WHEN
      jOuvreLeFormulairePourAjouterUneFeuilleDeRoute()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter une feuille de route' })
      expect(drawer).toHaveAttribute('id', 'drawerAjouterFeuilleDeRouteId')
      const titre = within(drawer).getByRole('heading', { level: 1, name: 'Ajouter une feuille de route' })
      expect(titre).toBeInTheDocument()
      const champsObligatoires = within(drawer).getByText(matchWithoutMarkup('Les champs avec * sont obligatoires.'), { selector: 'p' })
      expect(champsObligatoires).toBeInTheDocument()

      const formulaire = within(drawer).getByRole('form', { name: 'Ajouter' })
      expect(formulaire).toHaveAttribute('method', 'dialog')
      const nom = within(formulaire).getByRole('textbox', { name: 'Quel est le nom de la feuille de route ? *' })
      expect(nom).toBeRequired()
      expect(nom).toHaveAttribute('name', 'nom')
      expect(nom).toHaveAttribute('type', 'text')
      const porteur = within(formulaire).getByRole('combobox', { name: 'Quel membre de la gouvernance porte la feuille de route ? *' })
      expect(porteur).toBeRequired()
      const choisir = within(porteur).getByRole('option', { name: 'Choisir', selected: true })
      expect(choisir).toBeInTheDocument()
      const membre1 = within(porteur).getByRole('option', { name: 'Croix Rouge Française' })
      expect(membre1).toBeInTheDocument()
      const membre2 = within(porteur).getByRole('option', { name: 'La Poste' })
      expect(membre2).toBeInTheDocument()

      const fieldsets = within(formulaire).getAllByRole('group')
      const perimetre = within(fieldsets[0]).getByText(matchWithoutMarkup('Quel est le périmètre géographique de la feuille de route ? *'), { selector: 'legend' })
      expect(perimetre).toBeInTheDocument()
      const regional = within(formulaire).getByRole('radio', { name: 'Régional' })
      expect(regional).toBeRequired()
      expect(regional).toHaveAttribute('value', 'regional')
      const departemental = within(formulaire).getByRole('radio', { name: 'Départemental' })
      expect(departemental).toBeRequired()
      expect(departemental).toHaveAttribute('value', 'departemental')
      const epciGroupement = within(formulaire).getByRole('radio', { name: 'EPCI ou groupement de communes' })
      expect(epciGroupement).toBeRequired()
      expect(epciGroupement).toHaveAttribute('value', 'epci_groupement')
      const contratPreexistant = within(fieldsets[1]).getByText(matchWithoutMarkup('La feuille de route s’appuie-t-elle sur un contrat préexistant ? *'), { selector: 'legend' })
      expect(contratPreexistant).toBeInTheDocument()
      const oui = within(formulaire).getByRole('radio', { name: 'Oui' })
      expect(oui).toBeRequired()
      expect(oui).toHaveAttribute('value', 'oui')
      const non = within(formulaire).getByRole('radio', { name: 'Non' })
      expect(non).toBeRequired()
      expect(non).toHaveAttribute('value', 'non')

      const enregistrer = within(formulaire).getByRole('button', { name: 'Enregistrer' })
      expect(enregistrer).toBeEnabled()
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLesFeuillesDeRoute()

      // WHEN
      jOuvreLeFormulairePourAjouterUneFeuilleDeRoute()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter une feuille de route' })
      const fermer = jeFermeLeFormulaire()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterFeuilleDeRouteId')
      expect(drawer).not.toBeVisible()
    })

    it('puis que je remplis correctement le formulaire, alors le drawer se ferme, une notification s’affiche, la liste des feuilles de route est mise à jour et le formulaire est réinitialisé', async () => {
      // GIVEN
      const ajouterUneFeuilleDeRouteAction = vi.fn(async () => Promise.resolve(['OK']))
      vi.stubGlobal('dsfr', stubbedConceal())
      afficherLesFeuillesDeRoute({ ajouterUneFeuilleDeRouteAction, pathname: '/gouvernance/11/feuilles-de-route' })

      // WHEN
      jOuvreLeFormulairePourAjouterUneFeuilleDeRoute()
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter une feuille de route' })
      const nom = jeTapeLeNomDeLaFeuilleDeRoute('Feuille de route du Rhône')
      jeSelectionneUnMembre('membre2FooId')
      jeSelectionneUnPerimetre('Régional')
      jeSelectionneUnContrat('Oui')
      const enregistrer = jEnregistreLaFeuilleDeRoute()

      // THEN
      expect(enregistrer).toHaveAccessibleName('Ajout en cours...')
      expect(enregistrer).toBeDisabled()
      const perimetre = await screen.findByRole('radio', { checked: false, hidden: true, name: 'Régional' })
      expect(perimetre).toBeInTheDocument()
      const contratPreexistant = screen.getByRole('radio', { checked: false, hidden: true, name: 'Oui' })
      expect(contratPreexistant).toBeInTheDocument()
      expect(nom).toHaveValue('')
      expect(drawer).not.toBeVisible()
      expect(ajouterUneFeuilleDeRouteAction).toHaveBeenCalledWith({
        contratPreexistant: 'oui',
        nom: 'Feuille de route du Rhône',
        path: '/gouvernance/11/feuilles-de-route',
        perimetre: 'regional',
        uidGouvernance: 'gouvernanceFooId',
        uidMembre: 'membre2FooId',
      })
      const notification = await screen.findByRole('alert')
      expect(notification.textContent).toBe('Feuille de route ajoutée')
      expect(enregistrer).toHaveAccessibleName('Enregistrer')
      expect(enregistrer).toBeEnabled()
    })
  })

  it('puis que je remplis correctement le formulaire mais qu’une erreur intervient, alors une notification s’affiche', async () => {
    // GIVEN
    const ajouterUneFeuilleDeRouteAction = vi.fn(async () => Promise.resolve(['Le format est incorrect', 'autre erreur']))
    vi.stubGlobal('dsfr', stubbedConceal())
    afficherLesFeuillesDeRoute({ ajouterUneFeuilleDeRouteAction })

    // WHEN
    jOuvreLeFormulairePourAjouterUneFeuilleDeRoute()
    jeTapeLeNomDeLaFeuilleDeRoute('Feuille de route du Rhône')
    jeSelectionneUnMembre('membre1FooId')
    jeSelectionneUnPerimetre('Régional')
    jeSelectionneUnContrat('Oui')
    jEnregistreLaFeuilleDeRoute()

    // THEN
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le format est incorrect, autre erreur')
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
    presserLeBoutonRadio(name)
  }

  function jeSelectionneUnContrat(name: string): void {
    presserLeBoutonRadio(name)
  }

  function jEnregistreLaFeuilleDeRoute(): HTMLElement {
    return presserLeBouton('Enregistrer')
  }

  function jeFermeLeFormulaire(): HTMLElement {
    return presserLeBouton('Fermer le formulaire d’ajout d’une feuille de route')
  }

  function jOuvreLeFormulairePourAjouterUneFeuilleDeRoute(): void {
    presserLeBouton('Ajouter une feuille de route')
  }

  function afficherLesFeuillesDeRoute(
    options?: Partial<Parameters<typeof renderComponent>[1]>,
    mesInformationsPersonnellesReadModel = feuillesDeRouteReadModelFactory()
  ): void {
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(mesInformationsPersonnellesReadModel)
    renderComponent(<FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />, options)
  }
})
