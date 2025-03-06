import { screen, within } from '@testing-library/react'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import FeuillesDeRoute from './FeuillesDeRoute'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('les feuilles de route d’une gouvernance', () => {
  it('quand j’affiche la page des feuilles de route, alors elles s’affichent avec leurs actions et le total des budgets', () => {
    // WHEN
    afficherLesFeuillesDeRoute()

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Feuilles de route · Seine-Saint-Denis' })
    expect(titre).toBeInTheDocument()
    const boutonAjouterUneFeuilleDeRoute = screen.getByRole('button', { name: 'Ajouter une feuille de route' })
    expect(boutonAjouterUneFeuilleDeRoute).toBeInTheDocument()
    const sectionBudgetGlobal = screen.getByRole('region', { name: 'budget-global' })
    const montantTotalDesSubventions = within(sectionBudgetGlobal).getAllByText('0 €', { selector: 'p' })[0]
    expect(montantTotalDesSubventions).toBeInTheDocument()
    const labelMontantTotalDesSubventions = within(sectionBudgetGlobal).getByText('Total des financements accordés', { selector: 'p' })
    expect(labelMontantTotalDesSubventions).toBeInTheDocument()
    const montantTotalDesCofinancements = within(sectionBudgetGlobal).getAllByText('0 €', { selector: 'p' })[0]
    expect(montantTotalDesCofinancements).toBeInTheDocument()
    const labelMontantTotalDesCofinancements = screen.getByText('Total des co-financements', { selector: 'p' })
    expect(labelMontantTotalDesCofinancements).toBeInTheDocument()
    const montantBudgetTotalDesFeuillesDeRoute = within(sectionBudgetGlobal).getAllByText('0 €', { selector: 'p' })[2]
    expect(montantBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
    const labelBudgetTotalDesFeuillesDeRoute = screen.getByText('Budget total des feuilles de route', { selector: 'p' })
    expect(labelBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
    const listeDesFeuillesDeRoute = screen.getByRole('list', { name: 'Feuilles de route' })
    expect(listeDesFeuillesDeRoute).toBeInTheDocument()
    const elementsDeLaListeDesFeuillesDeRoute = within(listeDesFeuillesDeRoute).getAllByRole('listitem')
    const premiereFeuilleDeRoute = elementsDeLaListeDesFeuillesDeRoute[0]
    const titreDeLaPremiereFeuilleDeRoute = within(premiereFeuilleDeRoute).getByRole('heading', { level: 2, name: 'Feuille de route 1' })
    expect(titreDeLaPremiereFeuilleDeRoute).toBeInTheDocument()
    const lientVoirDetails = within(premiereFeuilleDeRoute).getByRole('link', { name: 'Voir le détail' })
    expect(lientVoirDetails).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId1')
    const LienPorteurDeLaFeuilleDeRoute = within(premiereFeuilleDeRoute).getAllByRole('link', { name: 'CC des Monts du Lyonnais' })[0]
    expect(LienPorteurDeLaFeuilleDeRoute).toBeInTheDocument()
    const wordingNombreCofinanceursEtBeneficiaires = within(premiereFeuilleDeRoute).getByText(matchWithoutMarkup('5 bénéficiaires, 3 co-financeurs'))
    expect(wordingNombreCofinanceursEtBeneficiaires).toBeInTheDocument()
    const nombreDactions = within(premiereFeuilleDeRoute).getByText('2 actions attachées à cette feuille de route', { selector: 'p' })
    expect(nombreDactions).toBeInTheDocument()
    const boutonAjouterUneAction = within(premiereFeuilleDeRoute).getByRole('link', { name: 'Ajouter une action' })
    expect(boutonAjouterUneAction).toHaveAttribute('href', '/gouvernance/11/feuille-de-route/feuilleDeRouteFooId1/action/ajouter')
    expect(boutonAjouterUneAction).toBeInTheDocument()
    const listeDesActions = within(premiereFeuilleDeRoute).getByRole('list', { name: 'actions' })
    expect(listeDesActions).toBeInTheDocument()
    const elementsDeLaListeDesActions = within(listeDesActions).getAllByRole('listitem')
    expect(elementsDeLaListeDesActions).toHaveLength(2)
    const premiereAction = elementsDeLaListeDesActions[0]
    const typeDeLaPremiereAction = within(premiereAction).getByRole('button', { name: 'Structurer une filière de reconditionnement locale 1' })
    expect(typeDeLaPremiereAction).toHaveAttribute('type', 'button')
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
    const sectionOuvrirPdf = screen.getAllByRole('region', { name: 'Feuille de route inclusion.pdf' })[0]
    const titreSectionOuvrirPdf = within(sectionOuvrirPdf).getByRole('heading', { level: 2, name: 'Feuille de route inclusion.pdf' })
    expect(titreSectionOuvrirPdf).toBeInTheDocument()
    const informationsFichier = within(sectionOuvrirPdf).getByText('Le 08/08/2024, 25 Mo, pdf.')
    expect(informationsFichier).toBeInTheDocument()
    const boutonOuvrirPdf = within(sectionOuvrirPdf).getByRole('button', { name: 'Ouvrir le pdf' })
    expect(boutonOuvrirPdf).toHaveAttribute('type', 'button')
  })

  it('quand il y a une seule feuille de route, alors le titre est au singulier', () => {
    // WHEN
    afficherLesFeuillesDeRoute({}, feuillesDeRouteReadModelFactory({
      departement: 'Seine-Saint-Denis',
      feuillesDeRoute: [feuillesDeRouteReadModelFactory().feuillesDeRoute[0]],
    }))

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Feuille de route · Seine-Saint-Denis' })
    expect(titre).toBeInTheDocument()
  })

  it('quand il y a plusieurs feuilles de route, alors le titre est au pluriel', () => {
    // WHEN
    afficherLesFeuillesDeRoute()

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Feuilles de route · Seine-Saint-Denis' })
    expect(titre).toBeInTheDocument()
  })

  it('quand il y a plusieurs bénéficiaires, alors le texte est au pluriel', () => {
    // GIVEN
    const donnees = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
          beneficiaires: 2,
        },
      ],
    })

    // WHEN
    const resultat = feuillesDeRoutePresenter(donnees)

    // THEN
    expect(resultat.feuillesDeRoute[0].wordingNombreCofinanceursEtBeneficiaires).toBe('2 bénéficiaires, 3 co-financeurs')
  })

  it('quand il y a un seul bénéficiaire, alors le texte est au singulier', () => {
    // GIVEN
    const donnees = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
          beneficiaires: 1,
        },
      ],
    })

    // WHEN
    const resultat = feuillesDeRoutePresenter(donnees)

    // THEN
    expect(resultat.feuillesDeRoute[0].wordingNombreCofinanceursEtBeneficiaires).toBe('1 bénéficiaire, 3 co-financeurs')
  })

  function afficherLesFeuillesDeRoute(
    options?: Partial<Parameters<typeof renderComponent>[1]>,
    mesInformationsPersonnellesReadModel = feuillesDeRouteReadModelFactory()
  ): void {
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(mesInformationsPersonnellesReadModel)
    renderComponent(<FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />, options)
  }
})
