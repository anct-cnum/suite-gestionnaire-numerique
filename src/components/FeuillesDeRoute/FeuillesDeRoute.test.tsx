import { screen, within } from '@testing-library/react'

import { matchWithoutMarkup, renderComponent } from '../testHelper'
import FeuillesDeRoute from './FeuillesDeRoute'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { epochTime } from '@/shared/testHelper'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('les feuilles de route d’une gouvernance', () => {
  it('quand j’affiche la page des feuilles de route, alors elles s’affichent avec leurs actions s’il y’en a et le total des budgets', () => {
    // WHEN
    const baseReadModel = feuillesDeRouteReadModelFactory()
    afficherLesFeuillesDeRoute({}, feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...baseReadModel.feuillesDeRoute[0],
          beneficiaires: 5,
          coFinanceurs: 3,
          pieceJointe: {
            apercu: '',
            emplacement: '',
            nom: 'user/1234/feuille-de-route-fake.pdf',
            upload: epochTime,
          },
        },
        {
          ...baseReadModel.feuillesDeRoute[1],
          actions: [],
          structureCoPorteuse: undefined,
        },
      ],
    }))

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
    const labelMontantTotalDesCofinancements = within(sectionBudgetGlobal).getByText('Total des co-financements', { selector: 'p' })
    expect(labelMontantTotalDesCofinancements).toBeInTheDocument()
    const montantBudgetTotalDesFeuillesDeRoute = within(sectionBudgetGlobal).getAllByText('0 €', { selector: 'p' })[2]
    expect(montantBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
    const labelBudgetTotalDesFeuillesDeRoute = within(sectionBudgetGlobal).getByText('Budget total des feuilles de route', { selector: 'p' })
    expect(labelBudgetTotalDesFeuillesDeRoute).toBeInTheDocument()
    const listeDesFeuillesDeRoute = screen.getByRole('list', { name: 'Feuilles de route' })
    expect(listeDesFeuillesDeRoute).toBeInTheDocument()
    const elementsDeLaListeDesFeuillesDeRoute = within(listeDesFeuillesDeRoute).getAllByRole('listitem')
    const premiereFeuilleDeRoute = elementsDeLaListeDesFeuillesDeRoute[0]
    const titreDeLaPremiereFeuilleDeRoute = within(premiereFeuilleDeRoute).getByRole('heading', { level: 2, name: 'Feuille de route 1' })
    expect(titreDeLaPremiereFeuilleDeRoute).toBeInTheDocument()
    const lientVoirDetails = within(premiereFeuilleDeRoute).getByRole('link', { name: 'Voir le détail' })
    expect(lientVoirDetails).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId1')
    const lienPorteurDeLaFeuilleDeRoute = within(premiereFeuilleDeRoute).getAllByRole('link', { name: 'CC des Monts du Lyonnais' })[0]
    expect(lienPorteurDeLaFeuilleDeRoute).toBeInTheDocument()
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
    const sectionOuvrirPdf = screen.getAllByRole('region', { name: 'feuille-de-route-fake.pdf' })[0]
    expect(sectionOuvrirPdf).toHaveAttribute('aria-labelledby', 'openPdf')
    const titreSectionOuvrirPdf = within(sectionOuvrirPdf).getByRole('heading', { level: 2, name: 'feuille-de-route-fake.pdf' })
    expect(titreSectionOuvrirPdf).toBeInTheDocument()
    const informationsFichier = within(sectionOuvrirPdf).getByText('Le 01/01/1970, 25 Mo, pdf.')
    expect(informationsFichier).toBeInTheDocument()
    const informationsLink = within(sectionOuvrirPdf).getByRole('link', { name: 'Ouvrir le pdf' })
    expect(informationsLink).toHaveAttribute('href', '/api/document-feuille-de-route/user/1234/feuille-de-route-fake.pdf')
    expect(informationsLink).toHaveAttribute('title', 'Ouvrir le pdf - nouvelle fenêtre')
    expect(informationsLink).toBeInTheDocument()
    const secondeFeuilleDeRoute = elementsDeLaListeDesFeuillesDeRoute[3]
    const titreDeLaSecondeFeuilleDeRoute = within(secondeFeuilleDeRoute)
      .getByRole('heading', { level: 2, name: 'Feuille de route 2' })
    expect(titreDeLaSecondeFeuilleDeRoute).toBeInTheDocument()
    expect(within(secondeFeuilleDeRoute)
      .getByRole('link', { name: 'Voir le détail' }))
      .toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId2')
    const infoAbsencePorteur = within(secondeFeuilleDeRoute).getByText('Aucune structure porteuse')
    expect(infoAbsencePorteur).toBeInTheDocument()
    const nombreDActionsSecondeFeuilleDeRoute = within(secondeFeuilleDeRoute)
      .getByText('0 action attachée à cette feuille de route', { selector: 'p' })
    expect(nombreDActionsSecondeFeuilleDeRoute).toBeInTheDocument()
    const listeDesActionsSecondeFeuilleDeRoute = within(secondeFeuilleDeRoute).queryByRole('list', { name: 'actions' })
    expect(listeDesActionsSecondeFeuilleDeRoute).not.toBeInTheDocument()
  })

  it('quand il n’y a pas de feuille de route, alors un bandeau s’affiche explicitant d’en ajouter', () => {
    // WHEN
    afficherLesFeuillesDeRoute({}, feuillesDeRouteReadModelFactory({ feuillesDeRoute: [] }))

    // THEN
    const labelMontantTotalDesSubventions = screen.queryByText('Total des subventions de l‘État', { selector: 'p' })
    expect(labelMontantTotalDesSubventions).not.toBeInTheDocument()
    const labelMontantTotalDesCofinancements = screen.queryByText('Total des co-financements', { selector: 'p' })
    expect(labelMontantTotalDesCofinancements).not.toBeInTheDocument()
    const labelBudgetTotalDesFeuillesDeRoute = screen.queryByText('Budget total des feuilles de route', { selector: 'p' })
    expect(labelBudgetTotalDesFeuillesDeRoute).not.toBeInTheDocument()

    const contenuFeuilleDeRoute = screen.getByRole('article')
    const contenuTitreFeuilleDeRoute = within(contenuFeuilleDeRoute).getByText('Aucune feuille de route', { selector: 'p' })
    expect(contenuTitreFeuilleDeRoute).toBeInTheDocument()
    const feuilleDeRoute = within(contenuFeuilleDeRoute).getByText('Cliquez sur le bouton ajouter une feuille de route pour définir votre première feuille de route.', { selector: 'p' })
    expect(feuilleDeRoute).toBeInTheDocument()
  })

  it('quand il y a une seule feuille de route, alors le titre est au singulier', () => {
    // WHEN
    afficherLesFeuillesDeRoute({}, feuillesDeRouteReadModelFactory({
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
          coFinanceurs: 3,
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
          coFinanceurs: 3,
        },
      ],
    })

    // WHEN
    const resultat = feuillesDeRoutePresenter(donnees)

    // THEN
    expect(resultat.feuillesDeRoute[0].wordingNombreCofinanceursEtBeneficiaires).toBe('1 bénéficiaire, 3 co-financeurs')
  })

  it('quand il n’y a pas de pièce jointe alors la section PDF n’est pas affichée', () => {
    // GIVEN
    const donnees = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
          pieceJointe: undefined,
        },
      ],
    })

    // WHEN
    afficherLesFeuillesDeRoute({}, donnees)

    // THEN
    const sectionOuvrirLePDF = screen.queryByRole('link', { name: 'Ouvrir le pdf' })
    expect(sectionOuvrirLePDF).not.toBeInTheDocument()
  })

  it('quand il y a une pièce jointe sans la date d’upload alors la date n’est pas affichée', () => {
    // GIVEN
    const donnees = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [
        {
          ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
          pieceJointe: {
            apercu: '',
            emplacement: '',
            nom: 'feuille-de-route-fake.pdf',
          },
        },
      ],
    })

    // WHEN
    afficherLesFeuillesDeRoute({}, donnees)

    // THEN
    const informationsFichier = screen.queryByText('Le 01/01/1970, 25 Mo, pdf.')
    expect(informationsFichier).not.toBeInTheDocument()
  })

  function afficherLesFeuillesDeRoute(
    options?: Partial<Parameters<typeof renderComponent>[1]>,
    readModel = feuillesDeRouteReadModelFactory({
      feuillesDeRoute: [{
        ...feuillesDeRouteReadModelFactory().feuillesDeRoute[0],
        pieceJointe: {
          apercu: '',
          emplacement: '',
          nom: 'user/1234/feuille-de-route-fake.pdf',
          upload: epochTime,
        },
      },
      feuillesDeRouteReadModelFactory().feuillesDeRoute[1],
      ],
    })
  ): void {
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(readModel)
    renderComponent(<FeuillesDeRoute feuillesDeRouteViewModel={feuillesDeRouteViewModel} />, options, { departement: 'Seine-Saint-Denis' })
  }
})
