import { fireEvent, render, screen, within } from '@testing-library/react'

import FeuilleDeRoute from './FeuilleDeRoute'
import { matchWithoutMarkup, renderComponent, stubbedServerAction } from '../testHelper'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'
import { feuilleDeRouteReadModelFactory, gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('feuille de route', () => {
  it('quand je consulte la page du détail d’une feuille de route avec des actions, alors j’accède à ses informations détaillées', () => {
    // GIVEN
    const viewModel = feuilleDeRoutePresenter(feuilleDeRouteReadModelFactory(),gouvernanceReadModelFactory())

    // WHEN
    render(<FeuilleDeRoute viewModel={viewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Feuille de route FNE' })
    expect(titre).toBeInTheDocument()
    const modifier = screen.getByRole('button', { description: 'Modifier la feuille de route', name: 'Modifier' })
    expect(modifier).toHaveAttribute('type', 'button')
    const porteur = screen.getByRole('link', { name: 'Orange' })
    expect(porteur).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/membreFooId')
    const perimetre = screen.getByText('Périmètre départemental')
    expect(perimetre).toBeInTheDocument()
    const resumeActions = screen.getByText('2 actions, 4 bénéficiaires, 2 co-financeurs')
    expect(resumeActions).toBeInTheDocument()
    const derniereEdition = screen.getByText('Modifiée le 01/01/1970 par Lucie Brunot')
    expect(derniereEdition).toBeInTheDocument()

    const sectionContextualisation = screen.getByRole('region', { name: 'Contextualisation des demandes de subvention' })
    const enTeteContextualisation = within(sectionContextualisation).getByRole('banner')
    const titreContextualisation = within(enTeteContextualisation).getByRole('heading', { level: 2, name: 'Contextualisation des demandes de subvention' })
    expect(titreContextualisation).toBeInTheDocument()
    const boutonContextualisation = within(enTeteContextualisation).getByRole('button', { description: 'Modifier la contextualisation', name: 'Modifier' })
    expect(boutonContextualisation).toHaveAttribute('type', 'button')

    const contextualisation1 = within(sectionContextualisation).getAllByText(matchWithoutMarkup('un paragraphe avec du bold.'), { selector: 'p' })
    expect(contextualisation1[0]).toBeInTheDocument()
    const contextualisation2 = within(sectionContextualisation).getAllByText('bold', { selector: 'b' })
    expect(contextualisation2[0]).toBeInTheDocument()
    const lirePlus = within(sectionContextualisation).getByRole('button', { name: 'Lire plus' })
    expect(lirePlus).toHaveAttribute('type', 'button')
    expect(lirePlus).toHaveClass('fr-icon-arrow-down-s-line')

    const sectionUpload = screen.getByRole('region', { name: 'feuille-de-route-fake.pdf' })
    const enTeteUpload = within(sectionUpload).getByRole('banner')
    const titreUpload = within(enTeteUpload).getByRole('heading', { level: 2, name: 'feuille-de-route-fake.pdf' })
    expect(titreUpload).toBeInTheDocument()
    const ouvrirPdf = screen.getByRole('link', { name: 'Ouvrir le pdf' })
    expect(ouvrirPdf).toHaveAttribute('href', '/api/document-feuille-de-route/user/fooId/feuille-de-route-fake.pdf')
    expect(ouvrirPdf).toOpenInNewTab('Ouvrir le pdf')
    const supprimerDocument = screen.getByRole('button', { name: 'Supprimer feuille-de-route-fake.pdf' })
    expect(supprimerDocument).toBeEnabled()
    expect(supprimerDocument).toHaveAttribute('type', 'button')

    const sectionActions = screen.getByRole('region', { name: '2 actions pour cette feuille de route' })
    const enTeteActions = within(sectionActions).getAllByRole('banner')
    const budgetActions = within(enTeteActions[0]).getByRole('list')
    const menuItemsActions = within(budgetActions).getAllByRole('listitem')
    expect(menuItemsActions).toHaveLength(3)
    const ligne1Actions = within(menuItemsActions[0]).getByText(matchWithoutMarkup('Budget total des actions 140 000 €'))
    expect(ligne1Actions).toBeInTheDocument()
    const ligne2Actions = within(menuItemsActions[1]).getByText(matchWithoutMarkup('Montant des financements accordés par l’état 30 000 €'))
    expect(ligne2Actions).toBeInTheDocument()
    const ligne3Actions = within(menuItemsActions[2]).getByText(matchWithoutMarkup('Montant des co-financements 90 000 €'))
    expect(ligne3Actions).toBeInTheDocument()
    const titreActions = within(enTeteActions[0]).getByRole('heading', { level: 2, name: '2 actions pour cette feuille de route' })
    expect(titreActions).toBeInTheDocument()
    const ajouterUneAction = within(sectionActions).getByRole('link', { name: 'Ajouter une action' })
    expect(ajouterUneAction).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId/action/ajouter')

    const action1 = within(sectionActions).getByRole('article', { name: 'Structurer une filière de reconditionnement locale 1' })
    const enTeteAction1 = within(action1).getByRole('banner')
    const lienAction1 = within(action1).getByRole('link', { description: 'Modifier Structurer une filière de reconditionnement locale 1', name: 'Modifier' })
    expect(lienAction1).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuille-de-route/feuilleDeRouteFooId/action/actionFooId1/modifier')
    const supprimerAction1 = within(action1).getByRole('button', { name: 'Supprimer Structurer une filière de reconditionnement locale 1' })
    expect(supprimerAction1).toBeEnabled()
    expect(supprimerAction1).toHaveAttribute('type', 'button')
    const titreAction1 = within(enTeteAction1).getByRole('heading', { level: 3, name: 'Structurer une filière de reconditionnement locale 1' })
    expect(titreAction1).toBeInTheDocument()
    const statutAction1 = within(action1).getByText('Subvention acceptée', { selector: 'p' })
    expect(statutAction1).toBeInTheDocument()
    const besoinsEtBeneficiairesAction1 = within(action1).getByText('Établir un diagnostic territorial, 2 bénéficiaires', { selector: 'p' })
    expect(besoinsEtBeneficiairesAction1).toBeInTheDocument()
    const porteursAction1 = within(action1).getByText(matchWithoutMarkup('Porteur : CC des Monts du Lyonnais'))
    expect(porteursAction1).toBeInTheDocument()
    const lienPorteurAction1 = within(action1).getByRole('link', { name: 'CC des Monts du Lyonnais' })
    expect(lienPorteurAction1).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membre/membreFooId')
    const budgetAction1 = within(action1).getByRole('list')
    const budgetItemsAction1 = within(budgetAction1).getAllByRole('listitem')
    expect(budgetItemsAction1).toHaveLength(3)
    const budgetPrevisionnelAction1 = within(budgetItemsAction1[0]).getByText(matchWithoutMarkup('Budget prévisionnel de l’action 100 000 €'))
    expect(budgetPrevisionnelAction1).toBeInTheDocument()
    const subventionDemandeeAction1 = within(budgetItemsAction1[1]).getByText(matchWithoutMarkup('Subvention demandée pour l’action : Enveloppe test 40 000 €'))
    expect(subventionDemandeeAction1).toBeInTheDocument()
    const cofinanceurAction1 = within(budgetItemsAction1[2]).getByText(matchWithoutMarkup('1 co-financeur 80 000 €'))
    expect(cofinanceurAction1).toBeInTheDocument()

    const action2 = within(sectionActions).getByRole('article', { name: 'Structurer une filière de reconditionnement locale 2' })
    expect(action2).toBeInTheDocument()
    const besoinsEtBeneficiairesAction2 = within(action2).getByText('-, 2 bénéficiaires', { selector: 'p' })
    expect(besoinsEtBeneficiairesAction2).toBeInTheDocument()
    const porteursAction2 = within(action2).getByText(matchWithoutMarkup('Porteur : -'))
    expect(porteursAction2).toBeInTheDocument()

    const sectionHistorique = screen.getByRole('region', { name: 'Activité et historique' })
    const enTeteHistorique = within(sectionHistorique).getByRole('banner')
    const titreHistorique = within(enTeteHistorique).getByRole('heading', { level: 2, name: 'Activité et historique' })
    expect(titreHistorique).toBeInTheDocument()
    const sousTitreHistorique = within(enTeteHistorique).getByText('Historique des dernières activités pour cette feuille de route.', { selector: 'p' })
    expect(sousTitreHistorique).toBeInTheDocument()

    const activiteEtHistorique = within(sectionHistorique).getByRole('table', { name: 'Activité et historique' })
    const [head, body] = within(activiteEtHistorique).getAllByRole('rowgroup')
    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')
    expect(columnsHead).toHaveLength(3)
    expect(columnsHead[0].textContent).toBe('Date')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Activité')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Éditeur')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    const rowsBody = within(body).getAllByRole('row')
    const columns1Body = within(rowsBody[0]).getAllByRole('cell')
    expect(columns1Body).toHaveLength(3)
    expect(columns1Body[0].textContent).toBe('12/02/2024')
    expect(columns1Body[1].textContent).toBe('Versement effectué')
    expect(columns1Body[2].textContent).toBe('Par Banque des territoires')
    const columns2Body = within(rowsBody[1]).getAllByRole('cell')
    expect(columns2Body).toHaveLength(3)
    expect(columns2Body[0].textContent).toBe('08/02/2024')
    expect(columns2Body[1].textContent).toBe('Demande acceptée')
    expect(columns2Body[2].textContent).toBe('Par ANCT')
    const columns3Body = within(rowsBody[2]).getAllByRole('cell')
    expect(columns3Body).toHaveLength(3)
    expect(columns3Body[0].textContent).toBe('15/01/2024')
    expect(columns3Body[1].textContent).toBe('Action Structurer un fonds local pour l’inclusion numérique')
    expect(columns3Body[2].textContent).toBe('Par Lucie B')
  })

  it('quand je consulte la page du détail d’une feuille de route sans document, alors j’ai l’encart pour en ajouter un', () => {
    // GIVEN
    const viewModel = feuilleDeRoutePresenter({
      ...feuilleDeRouteReadModelFactory(),
      document: undefined,
    }, gouvernanceReadModelFactory())

    // WHEN
    render(<FeuilleDeRoute viewModel={viewModel} />)

    // THEN
    const sectionUpload = screen.getByRole('region', { name: 'Déposez votre document de stratégie' })
    const enTeteUpload = within(sectionUpload).getByRole('banner')
    const titreUpload = within(enTeteUpload).getByRole('heading', { level: 2, name: 'Déposez votre document de stratégie' })
    expect(titreUpload).toBeInTheDocument()
    const boutonUpload = within(sectionUpload).getByLabelText('Taille maximale : 25 Mo. Format .pdf')
    expect(boutonUpload).toHaveAttribute('type', 'file')
  })

  it('quand je consulte la page du détail d’une feuille de route sans porteur, alors j’ai un "-" à la place', () => {
    // GIVEN
    const viewModel = feuilleDeRoutePresenter({
      ...feuilleDeRouteReadModelFactory(),
      porteur: undefined,
    }, gouvernanceReadModelFactory())

    // WHEN
    render(<FeuilleDeRoute viewModel={viewModel} />)

    // THEN
    const porteur = screen.getByTitle('Aucun responsable de la feuille de route')
    expect(porteur).toBeInTheDocument()
  })

  it('quand je clique sur le bouton supprimer le document, alors le document est supprimé', async () => {
    // GIVEN
    const supprimerDocumentAction = stubbedServerAction(['OK'])
    const viewModel = feuilleDeRoutePresenter(feuilleDeRouteReadModelFactory(), gouvernanceReadModelFactory())

    // WHEN
    renderComponent(<FeuilleDeRoute viewModel={viewModel} />, { supprimerDocumentAction })

    const supprimerDocument = screen.getByRole('button', { name: 'Supprimer feuille-de-route-fake.pdf' })
    fireEvent.click(supprimerDocument)

    // THEN
    expect(supprimerDocumentAction).toHaveBeenCalledWith({
      path: '/',
      uidFeuilleDeRoute: viewModel.uidFeuilleDeRoute,
    })
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Document supprimé')
  })

  it('quand je clique sur le bouton supprimer le document mais qu‘une erreur intervient, alors une notification d‘erreur s‘affiche', async () => {
    // GIVEN
    const supprimerDocumentAction = stubbedServerAction(['Le document est introuvable', 'Erreur de permission'])
    const viewModel = feuilleDeRoutePresenter(feuilleDeRouteReadModelFactory(), gouvernanceReadModelFactory())

    // WHEN
    renderComponent(<FeuilleDeRoute viewModel={viewModel} />, { supprimerDocumentAction })

    const supprimerDocument = screen.getByRole('button', { name: 'Supprimer feuille-de-route-fake.pdf' })
    fireEvent.click(supprimerDocument)

    // THEN
    expect(supprimerDocumentAction).toHaveBeenCalledWith({
      path: '/',
      uidFeuilleDeRoute: viewModel.uidFeuilleDeRoute,
    })
    const notification = await screen.findByRole('alert')
    expect(notification.textContent).toBe('Erreur : Le document est introuvable, Erreur de permission')
  })
})
