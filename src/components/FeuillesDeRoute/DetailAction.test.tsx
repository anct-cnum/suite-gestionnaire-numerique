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
      const drawer = screen.getByRole('dialog', { hidden: false, name: 'Structurer une filière de reconditionnement locale 2' })
      expect(drawer).toHaveAttribute('id', 'drawerActionId')
      const titre = within(drawer).getByRole('heading', { level: 1, name: 'Structurer une filière de reconditionnement locale 2' })
      expect(titre).toBeInTheDocument()

      const besoins = within(drawer).getByRole('list', { name: 'Besoins' })
      const besoinsItems = within(besoins).getAllByRole('listitem')
      expect(besoinsItems).toHaveLength(3)
      const statut = within(besoinsItems[0]).getByText('Subvention acceptée')
      expect(statut).toBeInTheDocument()
      const diagnostic = within(besoinsItems[1]).getByText('Établir un diagnostic territorial')
      expect(diagnostic).toBeInTheDocument()
      const appuiJuridique = within(besoinsItems[2]).getByText('Appui juridique dédié à la gouvernance')
      expect(appuiJuridique).toBeInTheDocument()

      const porteurLabel = within(drawer).getByText('Porteur de l’action')
      expect(porteurLabel).toBeInTheDocument()
      const porteur = within(drawer).getByRole('link', { name: 'CC des Monts du Lyonnais' })
      expect(porteur).toHaveAttribute('href', '/')

      const descriptionLabel = within(drawer).getByText('Description de l’action')
      expect(descriptionLabel).toBeInTheDocument()
      const description = within(drawer).getByText(matchWithoutMarkup('Aliquam maecenas augue morbi risus sed odio. Sapien imperdiet feugiat at nibh dui amet. Leo euismod sit ultrices nulla lacus aliquet tellus.'), { selector: 'p' })
      expect(description).toBeInTheDocument()
      const lirePlus = screen.getByRole('button', { name: 'Lire plus' })
      expect(lirePlus).toHaveAttribute('type', 'button')
      expect(lirePlus).toHaveClass('fr-icon-arrow-down-s-line')

      const budget = within(drawer).getByRole('list', { name: 'Budget prévisionnel' })
      const budgetItems = within(budget).getAllByRole('listitem')
      expect(budgetItems).toHaveLength(4)
      const budgetLigne1Gauche = within(budgetItems[0]).getByText('Budget prévisionnel 2024')
      expect(budgetLigne1Gauche).toBeInTheDocument()
      const budgetLigne1Droite = within(budgetItems[0]).getByText('20 000 €')
      expect(budgetLigne1Droite).toBeInTheDocument()
      const budgetLigne2Gauche = within(budgetItems[1]).getByText('Subvention de prestation')
      expect(budgetLigne2Gauche).toBeInTheDocument()
      const budgetLigne2Droite = within(budgetItems[1]).getByText('10 000 €')
      expect(budgetLigne2Droite).toBeInTheDocument()
      const budgetLigne3Gauche = within(budgetItems[2]).getByText('CC des Monts du Lyonnais')
      expect(budgetLigne3Gauche).toBeInTheDocument()
      const budgetLigne3Droite = within(budgetItems[2]).getByText('5 000 €')
      expect(budgetLigne3Droite).toBeInTheDocument()
      const budgetLigne4Gauche = within(budgetItems[3]).getByText('Croix Rouge Française')
      expect(budgetLigne4Gauche).toBeInTheDocument()
      const budgetLigne4Droite = within(budgetItems[3]).getByText('5 000 €')
      expect(budgetLigne4Droite).toBeInTheDocument()

      const beneficiaireLabel = within(drawer).getByText('Bénéficiaires des subventions')
      expect(beneficiaireLabel).toBeInTheDocument()
      const beneficiaires = within(drawer).getByRole('list', { name: 'Bénéficiaires des subventions' })
      const beneficiairesItems = within(beneficiaires).getAllByRole('listitem')
      expect(beneficiairesItems).toHaveLength(2)
      const beneficiaire1 = within(beneficiairesItems[0]).getByRole('link', { name: 'Croix Rouge Française' })
      expect(beneficiaire1).toHaveAttribute('href', '/')
      const beneficiaire2 = within(beneficiairesItems[1]).getByRole('link', { name: 'La Poste' })
      expect(beneficiaire2).toHaveAttribute('href', '/')

      const modifierAction = within(drawer).getByRole('link', { name: 'Modifier cette action' })
      expect(modifierAction).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId1/action/actionFooId2/modifier')
    })

    it('puis que je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLesFeuillesDeRoute()

      // WHEN
      jOuvreUneAction()
      const drawer = screen.queryByRole('dialog', { name: 'Structurer une filière de reconditionnement locale 2' })
      const fermer = jeFermeLAction()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerActionId')
      expect(drawer).not.toBeVisible()
    })
  })

  function jOuvreUneAction(): void {
    presserLeBouton('Structurer une filière de reconditionnement locale 2')
  }

  function jeFermeLAction(): HTMLElement {
    return presserLeBouton('Fermer le détail de Structurer une filière de reconditionnement locale 2')
  }

  function presserLeBouton(name: string): HTMLElement {
    const button = screen.getByRole('button', { name })
    fireEvent.click(button)
    return button
  }

  function afficherLesFeuillesDeRoute(
    options?: Partial<Parameters<typeof renderComponent>[1]>,
    mesInformationsPersonnellesReadModel = feuillesDeRouteReadModelFactory()
  ): void {
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(mesInformationsPersonnellesReadModel)
    renderComponent(<FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />, options)
  }
})
