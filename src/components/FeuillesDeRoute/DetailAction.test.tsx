import { fireEvent, screen, within } from '@testing-library/react'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import FeuillesDeRoute from './FeuillesDeRoute'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('détail d’une action', () => {
  describe('quand je clique sur une action,', () => {
    it('alors le drawer du détail de l’action s’affiche', () => {
      // GIVEN
      afficherLesFeuillesDeRoute()

      // WHEN
      jOuvreUneAction()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Structurer une filière de reconditionnement locale 1' })
      expect(drawer).toHaveAttribute('id', 'drawerActionIdfeuilleDeRouteFooId1')
      const titre = within(drawer).getByRole('heading', { level: 1, name: 'Structurer une filière de reconditionnement locale 1' })
      expect(titre).toBeInTheDocument()

      const besoins = within(drawer).getByRole('list', { name: 'Besoins' })
      const besoinsItems = within(besoins).getAllByRole('listitem')
      expect(besoinsItems).toHaveLength(2)
      const statut = within(drawer).getByText('Subvention validée')
      expect(statut).toBeInTheDocument()
      const diagnostic = within(besoinsItems[0]).getByText('Établir un diagnostic territorial')
      expect(diagnostic).toBeInTheDocument()
      const appuiJuridique = within(besoinsItems[1]).getByText('Appui juridique dédié à la gouvernance')
      expect(appuiJuridique).toBeInTheDocument()

      const porteurLabel = within(drawer).getByText('Porteur de l’action')
      expect(porteurLabel).toBeInTheDocument()
      const porteur = within(drawer).getByRole('link', { name: 'CC des Monts du Lyonnais' })
      expect(porteur).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/coPorteuseFooId')

      const descriptionLabel = within(drawer).getByText('Description de l’action')
      expect(descriptionLabel).toBeInTheDocument()
      const description = within(drawer).getByText(matchWithoutMarkup('Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.'), { selector: 'p' })
      expect(description).toBeInTheDocument()
      const lirePlus = screen.getByRole('button', { name: 'Lire plus' })
      expect(lirePlus).toHaveAttribute('type', 'button')
      expect(lirePlus).toHaveClass('fr-icon-arrow-down-s-line')
      const budget = within(drawer).getByRole('list', { name: 'Budget prévisionnel' })
      const budgetTerms = within(budget).getAllByRole('term')
      const budgetDefinitions = within(budget).getAllByRole('definition')
      expect(budgetTerms).toHaveLength(6)
      expect(budgetDefinitions).toHaveLength(6)
      const budgetLigne1Gauche = within(budgetTerms[0]).getByText('Budget prévisionnel')
      expect(budgetLigne1Gauche).toBeInTheDocument()
      const budgetLigne1Droite = within(budgetDefinitions[0]).getByText('70 000 €')
      expect(budgetLigne1Droite).toBeInTheDocument()
      const nomDeLEnveloppeDeFinancementAction1 = screen.getAllByText('Financement : Ingénierie France Numérique Ensemble')[0]
      expect(nomDeLEnveloppeDeFinancementAction1).toBeInTheDocument()
      const budgetLigne2Gauche = within(budgetTerms[1]).getByText('Prestation de service')
      expect(budgetLigne2Gauche).toBeInTheDocument()
      const budgetLigne2Droite = within(budgetDefinitions[1]).getByText('20 000 €')
      expect(budgetLigne2Droite).toBeInTheDocument()
      const budgetLigne3Gauche = within(budgetTerms[2]).getByText('Ressources humaine')
      expect(budgetLigne3Gauche).toBeInTheDocument()
      const budgetLigne3Droite = within(budgetDefinitions[2]).getByText('10 000 €')
      expect(budgetLigne3Droite).toBeInTheDocument()
      const budgetLigne4Gauche = within(budgetTerms[3]).getByText('Co-financeur 1')
      expect(budgetLigne4Gauche).toBeInTheDocument()
      const budgetLigne4Droite = within(budgetDefinitions[3]).getByText('20 000 €')
      expect(budgetLigne4Droite).toBeInTheDocument()
      const budgetLigne5Gauche = within(budgetTerms[4]).getByText('Co-financeur Orange')
      expect(budgetLigne5Gauche).toBeInTheDocument()
      const budgetLigne5Droite = within(budgetDefinitions[4]).getByText('10 000 €')
      expect(budgetLigne5Droite).toBeInTheDocument()
      const budgetLigne6Gauche = within(budgetTerms[5]).getByText('Co-financeur 1')
      expect(budgetLigne6Gauche).toBeInTheDocument()
      const budgetLigne6Droite = within(budgetDefinitions[5]).getByText('10 000 €')
      expect(budgetLigne6Droite).toBeInTheDocument()

      const beneficiaireLabel = within(drawer).getByText('Bénéficiaires des subventions')
      expect(beneficiaireLabel).toBeInTheDocument()
      const beneficiaires = within(drawer).getByRole('list', { name: 'Bénéficiaires des subventions' })
      const beneficiairesItems = within(beneficiaires).getAllByRole('listitem')
      expect(beneficiairesItems).toHaveLength(3)
      const beneficiaire1 = within(beneficiairesItems[0]).getByRole('link', { name: 'CAF DE LA CHARENTE' })
      expect(beneficiaire1).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/1')
      const beneficiaire2 = within(beneficiairesItems[1]).getByRole('link', { name: 'HUBIKOOP' })
      expect(beneficiaire2).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/2')

      const modifierAction = within(drawer).getByRole('link', { name: 'Modifier cette action' })
      expect(modifierAction).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId1/action/actionFooId1/modifier')
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLesFeuillesDeRoute()

      // WHEN
      jOuvreUneAction()
      const drawer = screen.queryByRole('dialog', { name: 'Structurer une filière de reconditionnement locale 1' })
      const fermer = jeFermeLAction()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerActionIdfeuilleDeRouteFooId1')
      expect(drawer).not.toBeVisible()
    })

    it('si l‘action n’a pas de porteurs, alors un tiret est affiché à la place du texte "porteurs de l‘action"', () => {
      // GIVEN
      afficherUneFeuilleDeRouteActionSansPorteur()

      // WHEN
      jOuvreUneActionSansPorteurs()

      // THEN
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Structurer une filière de reconditionnement locale 7' })
      const porteurLabel = within(drawer).queryByText('Porteur de l’action')
      expect(porteurLabel).toBeInTheDocument()
      const tiret = within(drawer).getByText('-')
      expect(tiret).toBeInTheDocument()
    })
  })

  function jOuvreUneAction(): void {
    presserLeBouton('Structurer une filière de reconditionnement locale 1')
  }

  function jOuvreUneActionSansPorteurs(): void {
    presserLeBouton('Structurer une filière de reconditionnement locale 7')
  }

  function jeFermeLAction(): HTMLElement {
    return presserLeBouton('Fermer le détail de Structurer une filière de reconditionnement locale 1')
  }

  function presserLeBouton(name: string): HTMLElement {
    const button = screen.getByRole('button', { name })
    fireEvent.click(button)
    return button
  }

  function afficherLesFeuillesDeRoute(
    options?: Partial<Parameters<typeof renderComponent>[1]>,
    feuillesDeRouteReadModel = feuillesDeRouteReadModelFactory()
  ): void {
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModel)
    renderComponent(<FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />, options)
  }

  function afficherUneFeuilleDeRouteActionSansPorteur(
    options?: Partial<Parameters<typeof renderComponent>[1]>,
    feuillesDeRouteReadModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [{
        ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
        actions: [{
          ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0]?.actions[0],
          nom: 'Structurer une filière de reconditionnement locale 7',
          porteurs: [],
        }],
        uid: 'feuilleDeRouteFooId1',
      }],
    })
  ): void {
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModel)
    renderComponent(<FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />, options)
  }
})
