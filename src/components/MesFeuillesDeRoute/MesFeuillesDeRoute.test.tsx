import { screen, within } from '@testing-library/react'

import { renderComponent } from '../testHelper'
import MesFeuillesDeRoute from './MesFeuillesDeRoute'
import { mesFeuillesDeRoutePresenter } from '@/presenters/mesFeuillesDeRoutePresenter'
import { mesFeuillesDeRouteViewModelFactory } from '@/presenters/testHelper'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('aperçu des feuilles de route', () => {
  describe('présentation de la page', () => {
    it('quand j’affiche la page des feuilles de route, alors je vois le titre de la page', () => {
      // GIVEN
      const mesFeuillesDeRouteViewModel = mesFeuillesDeRoutePresenter(feuillesDeRouteReadModelFactory())
      // WHEN
      renderComponent(
        <MesFeuillesDeRoute mesFeuillesDeRouteViewModel={mesFeuillesDeRouteViewModel} />
      )

      // THEN
      const titre = screen.getByRole('heading', { level: 1, name: 'Feuilles de route · Seine-Saint-Denis' })
      expect(titre).toBeInTheDocument()
      const boutonAjouterUneFeuilleDeRoute = screen.getByRole('button', { name: 'Ajouter une feuille de route' })
      expect(boutonAjouterUneFeuilleDeRoute).toBeInTheDocument()
      const sectionBudgetGlobal = screen.getByRole('region', { name: 'budget-global' })
      const montantTotalDesSubventions = within(sectionBudgetGlobal).getAllByText('0 €', { selector: 'p' })[0]
      expect(montantTotalDesSubventions).toBeInTheDocument()
      const labelMontantTotalDesSubventions = within(sectionBudgetGlobal).getByText('Total des subventions de l‘État', { selector: 'p' })
      expect(labelMontantTotalDesSubventions).toBeInTheDocument()
      const montantTotalDesCofinancements = within(sectionBudgetGlobal).getAllByText('0 €', { selector: 'p' })[0]
      expect(montantTotalDesCofinancements).toBeInTheDocument()
      const labelMontantTotalDesCofinancements = screen.getByText('Total des co-financements', { selector: 'p' })
      expect(labelMontantTotalDesCofinancements).toBeInTheDocument()
      const montantBudgetTotalDesFeuillesDeRoute = within(sectionBudgetGlobal).getAllByText('0 €', { selector: 'p' })[2]
      expect(montantBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
      const labelBudgetTotalDesFeuillesDeRoute = screen.getByText('Budget total des feuilles de route', { selector: 'p' })
      expect(labelBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
      const listeDesFeuillesDeRoute = screen.getByRole('list', { name: 'feuilles-de-route' })
      expect(listeDesFeuillesDeRoute).toBeInTheDocument()
      const elementsDeLaListeDesFeuillesDeRoute = within(listeDesFeuillesDeRoute).getAllByRole('listitem')
      const premiereFeuilleDeRoute = elementsDeLaListeDesFeuillesDeRoute[0]
      const titreDeLaPremiereFeuilleDeRoute = within(premiereFeuilleDeRoute).getByRole('heading', { level: 3, name: 'Feuille de route 1' })
      expect(titreDeLaPremiereFeuilleDeRoute).toBeInTheDocument()
      const boutonVoirDetails = within(premiereFeuilleDeRoute).getByRole('button', { name: 'Voir le détail' })
      expect(boutonVoirDetails).toBeInTheDocument()
      const LienPorteurDeLaFeuilleDeRoute = within(premiereFeuilleDeRoute).getAllByRole('link', { name: 'CC des Monts du Lyonnais' })[0]
      expect(LienPorteurDeLaFeuilleDeRoute).toBeInTheDocument()
      const nombreDeBeneficiaires = within(premiereFeuilleDeRoute).getByText('5 bénéficiaires', { selector: 'span' })
      expect(nombreDeBeneficiaires).toBeInTheDocument()
      const nombreCofinanceurs = within(premiereFeuilleDeRoute).getByText('3 co-financeurs', { selector: 'span' })
      expect(nombreCofinanceurs).toBeInTheDocument()
      const nombreDactions = within(premiereFeuilleDeRoute).getByText('2 actions attachées à cette feuille de route', { selector: 'p' })
      expect(nombreDactions).toBeInTheDocument()
      const boutonAjouterUneAction = within(premiereFeuilleDeRoute).getByRole('button', { name: 'Ajouter une action' })
      expect(boutonAjouterUneAction).toBeInTheDocument()
      const listeDesActions = within(premiereFeuilleDeRoute).getByRole('list', { name: 'actions' })
      expect(listeDesActions).toBeInTheDocument()
      const elementsDeLaListeDesActions = within(listeDesActions).getAllByRole('listitem')
      expect(elementsDeLaListeDesActions).toHaveLength(2)
      const premiereAction = elementsDeLaListeDesActions[0]
      const typeDeLaPremiereAction = within(premiereAction).getByText('Structurer une filière de reconditionnement locale 1', { selector: 'p' })
      expect(typeDeLaPremiereAction).toBeInTheDocument()
      const porteurDeLaPremiereAction = within(premiereAction).getByRole('link', { name: 'CC des Monts du Lyonnais' })
      expect(porteurDeLaPremiereAction).toBeInTheDocument()
      const badgeDeStatutDeLaPremiereAction = within(premiereAction).getByText('Subvention acceptée', { selector: 'p' })
      expect(badgeDeStatutDeLaPremiereAction).toBeInTheDocument()
      const labelBudgetTotalDeLaFeuilleDeRoute = within(premiereFeuilleDeRoute).getByText('Budget total de la feuille de route', { selector: 'p' })
      expect(labelBudgetTotalDeLaFeuilleDeRoute).toBeInTheDocument()
      const montantBudgetTotalDeLaFeuilleDeRoute = within(premiereFeuilleDeRoute).getByText('0 €', { selector: 'p' })
      expect(montantBudgetTotalDeLaFeuilleDeRoute).toBeInTheDocument()
      const detailDesMontantsDeSubvention = within(premiereFeuilleDeRoute).getByText('dont 0 € de co-financements et 0 € des financements accordés', { selector: 'p' })
      expect(detailDesMontantsDeSubvention).toBeInTheDocument()
    })

    it('quand il y a une seule feuille de route, alors le titre est au singulier', () => {
      // GIVEN
      const mesFeuillesDeRouteViewModel = mesFeuillesDeRouteViewModelFactory({
        feuillesDeRoute: [mesFeuillesDeRouteViewModelFactory().feuillesDeRoute[0]],
        titre: 'Feuille de route · 93',
      })

      // WHEN
      renderComponent(
        <MesFeuillesDeRoute mesFeuillesDeRouteViewModel={mesFeuillesDeRouteViewModel} />
      )

      // THEN
      const titre = screen.getByRole('heading', { level: 1, name: 'Feuille de route · 93' })
      expect(titre).toBeInTheDocument()
    })

    it('quand il y a plusieurs feuilles de route, alors le titre est au pluriel', () => {
      // GIVEN
      const mesFeuillesDeRouteViewModel = mesFeuillesDeRouteViewModelFactory()

      // WHEN
      renderComponent(
        <MesFeuillesDeRoute mesFeuillesDeRouteViewModel={mesFeuillesDeRouteViewModel} />
      )

      // THEN
      const titre = screen.getByRole('heading', { level: 1, name: 'Feuilles de route · 93' })
      expect(titre).toBeInTheDocument()
    })

    it('quand il y a une seule feuille de route ou bénéficiaire, alors le libellé est au singulier', () => {
      // GIVEN
      const donnees = feuillesDeRouteReadModelFactory({
        feuillesDeRoute: [
          {
            ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
            beneficiaires: 1,
            coFinanceurs: 1,
          },
        ],
      })

      // WHEN
      const resultat = mesFeuillesDeRoutePresenter(donnees)

      // THEN
      expect(resultat.feuillesDeRoute[0].beneficiaires).toBe('1 bénéficiaire')
      expect(resultat.feuillesDeRoute[0].coFinanceurs).toBe('1 co-financeur')
    })

    it('quand il y a plusieurs feuilles de route ou bénéficiaires, alors le libellé est au pluriel', () => {
      // GIVEN
      const donnees = feuillesDeRouteReadModelFactory({
        feuillesDeRoute: [
          {
            ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
            beneficiaires: 2,
            coFinanceurs: 3,
          },
        ],
      })

      // WHEN
      const resultat = mesFeuillesDeRoutePresenter(donnees)

      // THEN
      expect(resultat.feuillesDeRoute[0].beneficiaires).toBe('2 bénéficiaires')
      expect(resultat.feuillesDeRoute[0].coFinanceurs).toBe('3 co-financeurs')
    })
  })
})

