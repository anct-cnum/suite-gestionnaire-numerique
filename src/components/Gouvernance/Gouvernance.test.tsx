import { render, screen, within } from '@testing-library/react'

import Gouvernance from './Gouvernance'
import { matchWithoutMarkup, presserLeBouton } from '../testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('gouvernance', () => {
  it('quand j’affiche une gouvernance, alors elle s’affiche avec son titre et son sous titre', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ departement: 'Rhône' }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Inclusion numérique · Rhône' })
    expect(titre).toBeInTheDocument()
    const sousTitre = screen.getByText('Retrouvez la gouvernance établie au sein d’un département, sa composition et ses feuilles de route.', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()
  })

  it('quand j’affiche une gouvernance totalement vide, alors elle n’affiche pas ses résumés', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      comites: undefined,
      feuillesDeRoute: undefined,
      membres: undefined,
      noteDeContexte: undefined,
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const membre = screen.queryByText(matchWithoutMarkup('2 membres de la gouvernance'), { selector: 'p' })
    expect(membre).not.toBeInTheDocument()
    const membreAVide = screen.queryByText(matchWithoutMarkup('0 membre de la gouvernance'), { selector: 'p' })
    expect(membreAVide).not.toBeInTheDocument()
    const feuilleDeRoute = screen.queryByText(matchWithoutMarkup('2 feuilles de route territoriale'), { selector: 'p' })
    expect(feuilleDeRoute).not.toBeInTheDocument()
    const feuilleDeRouteVide = screen.queryByText(matchWithoutMarkup('0 feuille de route territoriale'), { selector: 'p' })
    expect(feuilleDeRouteVide).not.toBeInTheDocument()
    const auteurDeLaNote = screen.queryAllByText('Modifié le 01/01/1970 par Jean Deschamps', { selector: 'p' })
    expect(auteurDeLaNote).toStrictEqual([])
    const resume = screen.queryByText('Aucune note de contexte pour le moment.', { selector: 'p' })
    expect(resume).not.toBeInTheDocument()
    const contenuTitreComitologie = screen.getByText('Actuellement, vous n’avez pas de comité', { selector: 'p' })
    expect(contenuTitreComitologie).toBeInTheDocument()
  })

  it('quand j’affiche une gouvernance sans comité, alors elle s’affiche avec sa section lui demandant d’en ajouter un', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ comites: undefined, departement: 'Rhône' }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const sectionComitologie = screen.getByRole('region', { name: 'Comitologie' })
    const enTeteComitologie = within(sectionComitologie).getByRole('banner')
    const titreComitologie = within(enTeteComitologie).getByRole('heading', { level: 2, name: 'Comitologie' })
    expect(titreComitologie).toBeInTheDocument()
    const contenuComitologie = within(sectionComitologie).getByRole('article')
    const contenuTitreComitologie = within(contenuComitologie).getByText('Actuellement, vous n’avez pas de comité', { selector: 'p' })
    expect(contenuTitreComitologie).toBeInTheDocument()
    const comitologie = within(contenuComitologie).getByText('Renseignez les comités prévus et la fréquence à laquelle ils se réunissent.', { selector: 'p' })
    expect(comitologie).toBeInTheDocument()
    const ajouterUnComite = within(sectionComitologie).getByRole('button', { name: 'Ajouter un comité' })
    expect(ajouterUnComite).toHaveAttribute('type', 'button')
  })

  it('quand j’affiche une gouvernance sans comité et que je clique sur ajouter un comité, alors s’affiche le formulaire de création', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ comites: undefined, departement: 'Rhône' }), epochTimePlusOneDay)

    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    jOuvreLeFormulairePourAjouterUnComite()

    // THEN
    const ajouterUnComiteDrawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })
    expect(ajouterUnComiteDrawer).toBeVisible()
  })

  it('quand j’affiche une gouvernance sans comité et que je clique sur ajouter un comité puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ comites: undefined, departement: 'Rhône' }), epochTimePlusOneDay)
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    jOuvreLeFormulairePourAjouterUnComite()
    const drawer = screen.getByRole('dialog', { name: 'Ajouter un comité' })
    jeFermeLeFormulairePourAjouterUnComite()

    // THEN
    expect(drawer).not.toBeVisible()
  })

  it('quand j’affiche une gouvernance avec au moins un comité, alors elle s’affiche avec sa section comitologie', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      comites: [
        {
          commentaire: 'commentaire',
          date: epochTime,
          derniereEdition: epochTime,
          frequence: 'semestrielle',
          id: 1,
          nomEditeur: 'Tartempion',
          prenomEditeur: 'Michel',
          type: 'stratégique',
        },
        {
          commentaire: 'commentaire',
          date: epochTimePlusOneDay,
          derniereEdition: epochTimePlusOneDay,
          frequence: 'trimestrielle',
          id: 1,
          nomEditeur: 'Tartempion',
          prenomEditeur: 'Martin',
          type: 'technique',
        },
      ],
    }), epochTime)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const comitologie = screen.getByRole('region', { name: 'Comitologie' })
    const enTeteComitologie = within(comitologie).getByRole('banner')
    const titreComitologie = within(enTeteComitologie).getByRole('heading', { level: 2, name: 'Comitologie' })
    expect(titreComitologie).toBeInTheDocument()
    const ajouter = within(comitologie).getByRole('button', { name: 'Ajouter' })
    expect(ajouter).toHaveAttribute('type', 'button')
    const comites = screen.getByRole('table', { name: 'Comités' })
    const rowsGroup = within(comites).getAllByRole('rowgroup')
    const head = rowsGroup[0]
    expect(head).toHaveClass('fr-sr-only')
    const body = rowsGroup[1]
    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')
    expect(columnsHead).toHaveLength(3)
    expect(columnsHead[0].textContent).toBe('Logo')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Nom et date du prochain comité')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Périodicité')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    const rowsBody = within(body).getAllByRole('row')
    const columns1Body = within(rowsBody[0]).getAllByRole('cell')
    expect(columns1Body).toHaveLength(3)
    expect(columns1Body[1].textContent).toBe('Comité stratégique : 01/01/1970')
    expect(columns1Body[2].textContent).toBe('Semestriel')
    const columns2Body = within(rowsBody[1]).getAllByRole('cell')
    expect(columns2Body).toHaveLength(3)
    expect(columns2Body[1].textContent).toBe('Comité technique : 02/01/1970')
    expect(columns2Body[2].textContent).toBe('Trimestriel')
  })

  it('quand j’affiche une gouvernance sans membre, alors elle s’affiche avec son résumé et sa section lui demandant d’en ajouter un', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ departement: 'Rhône', membres: undefined }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const resumes = screen.getAllByText(matchWithoutMarkup('0 membre de la gouvernance'), { selector: 'div' })
    expect(resumes[0]).toBeInTheDocument()

    const sectionMembre = screen.getByRole('region', { name: '0 membre' })
    const enTeteMembre = within(sectionMembre).getByRole('banner')
    const titreMembre = within(enTeteMembre).getByRole('heading', { level: 2, name: '0 membre' })
    expect(titreMembre).toBeInTheDocument()
    const contenuMembre = within(sectionMembre).getByRole('article')
    const contenuTitreMembre = within(contenuMembre).getByText('Actuellement, il n’y a aucun membre dans la gouvernance', { selector: 'p' })
    expect(contenuTitreMembre).toBeInTheDocument()
    const membre = within(contenuMembre).getByText('Vous pouvez inviter les collectivités et structures qui n’ont pas encore manifesté leur souhait de participer et/ou de porter une feuille de route territoriale en leur partageant ce lien vers les formulaires prévus à cet effet :', { selector: 'p' })
    expect(membre).toBeInTheDocument()
    const lienMembre = screen.getByRole('link', { name: 'https://inclusion-numerique.anct.gouv.fr/gouvernance' })
    expect(lienMembre).toHaveAttribute('href', 'https://inclusion-numerique.anct.gouv.fr/gouvernance')
    expect(lienMembre).toOpenInNewTab('Formulaire d’invitation à la gouvernance')
    const ajouterDesMembres = within(sectionMembre).getByRole('button', { name: 'Ajouter un membre' })
    expect(ajouterDesMembres).toHaveAttribute('type', 'button')
  })

  it('quand j’affiche une gouvernance avec au moins un membre, alors elle s’affiche avec son résumé et sa section membre', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      membres: [
        {
          contactReferent: {
            denomination: 'Contact politique de la collectivité',
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
          links: {},
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          telephone: '+33 4 45 00 45 00',
          totalMontantSubventionAccorde: 0,
          totalMontantSubventionFormationAccorde: 0,
          type: 'Administration',
          typologieMembre: 'Préfecture départementale',
        },
        {
          contactReferent: {
            denomination: 'Contact politique de la collectivité',
            mailContact: 'didier.durand@exemple.com',
            nom: 'Didier',
            poste: 'chargé de mission',
            prenom: 'Durant',
          },
          feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }],
          links: {},
          nom: 'Département du Rhône',
          roles: ['coporteur', 'cofinanceur'],
          telephone: '+33 4 45 00 45 01',
          totalMontantSubventionAccorde: 0,
          totalMontantSubventionFormationAccorde: 0,
          type: 'Collectivité',
          typologieMembre: 'Collectivité, EPCI',
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('2 membres de la gouvernance'), { selector: 'p' })
    expect(resume).toBeInTheDocument()
    const lienResume = screen.getByRole('link', { name: 'Voir les membres' })
    expect(lienResume).toHaveAttribute('href', '/')

    const sectionMembre = screen.getByRole('region', { name: '2 membres' })
    const enTeteMembre = within(sectionMembre).getByRole('banner')
    const titreMembre = within(enTeteMembre).getByRole('heading', { level: 2, name: '2 membres' })
    expect(titreMembre).toBeInTheDocument()
    const sousTitreMembre = within(enTeteMembre).getByText('2 co-porteurs, 1 co-financeur', { selector: 'p' })
    expect(sousTitreMembre).toBeInTheDocument()
    const gerer = within(sectionMembre).getByRole('link', { name: 'Gérer' })
    expect(gerer).toHaveAttribute('href', '/')
    const membres = screen.getByRole('table', { name: 'Membres' })
    const rowsGroup = within(membres).getAllByRole('rowgroup')
    const head = rowsGroup[0]
    expect(head).toHaveClass('fr-sr-only')
    const body = rowsGroup[1]
    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')
    expect(columnsHead).toHaveLength(4)
    expect(columnsHead[0].textContent).toBe('Logo')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Nom')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Type')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    expect(columnsHead[3].textContent).toBe('Rôle')
    expect(columnsHead[3]).toHaveAttribute('scope', 'col')
    const rowsBody = within(body).getAllByRole('row')
    const columns1Body = within(rowsBody[0]).getAllByRole('cell')
    expect(columns1Body).toHaveLength(4)
    const membrePrefectureDuRhone = within(columns1Body[1]).getByRole('button', { name: 'Préfecture du Rhône' })
    expect(membrePrefectureDuRhone).toHaveAttribute('type', 'button')
    expect(membrePrefectureDuRhone).toHaveAttribute('aria-controls', 'drawerMembreId')
    expect(columns1Body[1].textContent).toBe('Préfecture du Rhône')
    expect(columns1Body[2].textContent).toBe('Administration')
    expect(columns1Body[3].textContent).toBe('Co-porteur ')
    const columns2Body = within(rowsBody[1]).getAllByRole('cell')
    expect(columns2Body).toHaveLength(4)
    const membreDepartementDuRhone = within(columns2Body[1]).getByRole('button', { name: 'Département du Rhône' })
    expect(membreDepartementDuRhone).toHaveAttribute('type', 'button')
    expect(membreDepartementDuRhone).toHaveAttribute('aria-controls', 'drawerMembreId')
    expect(columns2Body[1].textContent).toBe('Département du Rhône')
    expect(columns2Body[2].textContent).toBe('Collectivité')
    expect(columns2Body[3].textContent).toBe('Co-porteur Co-financeur ')
  })

  it('quand j’affiche une gouvernance avec qu’un membre, alors elle s’affiche avec son résumé au singulier et certains titres au singulier', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      membres: [
        {
          contactReferent: {
            denomination: 'Contact politique de la collectivité',
            mailContact: 'julien.deschamps@rhones.gouv.fr',
            nom: 'Henrich',
            poste: 'chargé de mission',
            prenom: 'Laetitia',
          },
          contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
          feuillesDeRoute: [{ montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route inclusion' }, { montantSubventionAccorde: 5_000, montantSubventionFormationAccorde: 5_000, nom: 'Feuille de route numérique du Rhône' }],
          links: { plusDetails: '/' },
          nom: 'Préfecture du Rhône',
          roles: ['coporteur'],
          telephone: '+33 4 45 00 45 00',
          totalMontantSubventionAccorde: 0,
          totalMontantSubventionFormationAccorde: 0,
          type: 'Administration',
          typologieMembre: 'Préfecture départementale',
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('1 membre de la gouvernance'), { selector: 'p' })
    expect(resume).toBeInTheDocument()

    const sectionMembre = screen.getByRole('region', { name: '1 membre' })
    const enTeteMembre = within(sectionMembre).getByRole('banner')
    const titreMembre = within(enTeteMembre).getByRole('heading', { level: 2, name: '1 membre' })
    expect(titreMembre).toBeInTheDocument()
    const sousTitreMembre = within(enTeteMembre).getByText('1 co-porteur', { selector: 'p' })
    expect(sousTitreMembre).toBeInTheDocument()
  })

  it('quand j’affiche une gouvernance sans feuille de route, alors elle s’affiche avec son résumé à 0 et sa section lui demandant d’en ajouter une', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ departement: 'Rhône', feuillesDeRoute: undefined }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const resumes = screen.getAllByText(matchWithoutMarkup('0 feuille de route territoriale'), { selector: 'div' })
    expect(resumes[0]).toBeInTheDocument()

    const sectionFeuilleDeRoute = screen.getByRole('region', { name: '0 feuille de route' })
    const enTeteFeuilleDeRoute = within(sectionFeuilleDeRoute).getByRole('banner')
    const titreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByRole('heading', { level: 2, name: '0 feuille de route' })
    expect(titreFeuilleDeRoute).toBeInTheDocument()
    const contenuFeuilleDeRoute = within(sectionFeuilleDeRoute).getAllByRole('article')
    const contenuTitreFeuilleDeRoute = within(contenuFeuilleDeRoute[0]).getByText('Aucune feuille de route', { selector: 'p' })
    expect(contenuTitreFeuilleDeRoute).toBeInTheDocument()
    const feuilleDeRoute = within(contenuFeuilleDeRoute[0]).getByText('Commencez par créer des porteurs au sein de la gouvernance pour définir votre première feuille de route.', { selector: 'p' })
    expect(feuilleDeRoute).toBeInTheDocument()
    const ajouterDesFeuilleDeRoutes = within(sectionFeuilleDeRoute).getByRole('button', { name: 'Ajouter une feuille de route' })
    expect(ajouterDesFeuilleDeRoutes).toHaveAttribute('type', 'button')
  })

  it('quand j’affiche une gouvernance avec au moins une feuille de route, alors elle s’affiche avec son résumé et sa section feuille de route', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' }],
          beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' }],
          budgetGlobal: 145_000,
          montantSubventionAccorde: 105_000,
          montantSubventionDemande: 120_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion',
          porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
          totalActions: 3,
        },
        {
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' }],
          beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' }],
          budgetGlobal: 88_030,
          montantSubventionAccorde: 38_030,
          montantSubventionDemande: 50_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route numérique du Rhône',
          porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
          totalActions: 1,
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('2 feuilles de route territoriale'), { selector: 'p' })
    expect(resume).toBeInTheDocument()
    const lienResume = screen.getByRole('link', { name: 'Voir les feuilles de route' })
    expect(lienResume).toHaveAttribute('href', '/feuilles-de-route')

    const sectionFeuilleDeRoute = screen.getByRole('region', { name: '2 feuilles de route' })
    const enTeteFeuilleDeRoute = within(sectionFeuilleDeRoute).getByRole('banner')
    const titreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByRole('heading', { level: 2, name: '2 feuilles de route' })
    expect(titreFeuilleDeRoute).toBeInTheDocument()
    const sousTitreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByText('2 feuilles de route, 233 030 €', { selector: 'p' })
    expect(sousTitreFeuilleDeRoute).toBeInTheDocument()
    const gerer = within(sectionFeuilleDeRoute).getByRole('link', { name: 'Gérer' })
    expect(gerer).toHaveAttribute('href', '/')
    const FeuillesDeRoute = screen.getByRole('table', { name: 'Feuilles de route' })
    const rowsGroup = within(FeuillesDeRoute).getAllByRole('rowgroup')
    const head = rowsGroup[0]
    expect(head).toHaveClass('fr-sr-only')
    const body = rowsGroup[1]
    const rowHead = within(head).getByRole('row')
    const columnsHead = within(rowHead).getAllByRole('columnheader')
    expect(columnsHead).toHaveLength(4)
    expect(columnsHead[0].textContent).toBe('Logo')
    expect(columnsHead[0]).toHaveAttribute('scope', 'col')
    expect(columnsHead[1].textContent).toBe('Nom')
    expect(columnsHead[1]).toHaveAttribute('scope', 'col')
    expect(columnsHead[2].textContent).toBe('Action')
    expect(columnsHead[2]).toHaveAttribute('scope', 'col')
    expect(columnsHead[3].textContent).toBe('Budget total')
    expect(columnsHead[3]).toHaveAttribute('scope', 'col')
    const rowsBody = within(body).getAllByRole('row')
    const columns1Body = within(rowsBody[0]).getAllByRole('cell')
    expect(columns1Body).toHaveLength(4)
    expect(columns1Body[1].textContent).toBe('Feuille de route inclusion')
    expect(columns1Body[2].textContent).toBe('3 actions')
    expect(columns1Body[3].textContent).toBe('145 000 €')
    const columns2Body = within(rowsBody[1]).getAllByRole('cell')
    expect(columns2Body).toHaveLength(4)
    expect(columns2Body[1].textContent).toBe('Feuille de route numérique du Rhône')
    expect(columns2Body[2].textContent).toBe('1 action')
    expect(columns2Body[3].textContent).toBe('88 030 €')
  })

  it('quand j’affiche une gouvernance avec qu’une feuille de route, alors elle s’affiche avec son résumé dont le lien est directement vers la feuille de route et certains titres au singulier', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' }],
          beneficiairesSubventionFormation: [{ nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Structure' }],
          budgetGlobal: 145_000,
          montantSubventionAccorde: 100_000,
          montantSubventionDemande: 115_000,
          montantSubventionFormationAccorde: 5_000,
          nom: 'Feuille de route inclusion',
          porteur: { nom: 'Préfecture du Rhône', roles: ['coporteur'], type: 'Administration' },
          totalActions: 3,
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('1 feuille de route territoriale'), { selector: 'p' })
    expect(resume).toBeInTheDocument()
    const lienResume = screen.getByRole('link', { name: 'Voir la feuille de route' })
    expect(lienResume).toHaveAttribute('href', '/feuille-de-route')

    const sectionFeuilleDeRoute = screen.getByRole('region', { name: '1 feuille de route' })
    const enTeteFeuilleDeRoute = within(sectionFeuilleDeRoute).getByRole('banner')
    const titreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByRole('heading', { level: 2, name: '1 feuille de route' })
    expect(titreFeuilleDeRoute).toBeInTheDocument()
    const sousTitreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByText('1 feuille de route, 145 000 €', { selector: 'p' })
    expect(sousTitreFeuilleDeRoute).toBeInTheDocument()
  })

  it('quand j’affiche une gouvernance sans note de contexte, alors elle s’affiche avec sa section lui demandant d’en ajouter une', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ departement: 'Rhône', noteDeContexte: undefined }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const sectionNoteDeContexte = screen.getByRole('region', { name: 'Note de contexte' })
    const enTeteNoteDeContexte = within(sectionNoteDeContexte).getByRole('banner')
    const titreNoteDeContexte = within(enTeteNoteDeContexte).getByRole('heading', { level: 2, name: 'Note de contexte' })
    expect(titreNoteDeContexte).toBeInTheDocument()
    const contenuNoteDeContexte = within(sectionNoteDeContexte).getByRole('article')
    const contenuTitreNoteDeContexte = within(contenuNoteDeContexte).getByText('Aucune note de contexte', { selector: 'p' })
    expect(contenuTitreNoteDeContexte).toBeInTheDocument()
    const noteDeContexte = within(contenuNoteDeContexte).getByText('Précisez, au sein d’une note qualitative, les spécificités de votre démarche, les éventuelles difficultés que vous rencontrez, ou tout autre élément que vous souhaitez porter à notre connaissance.', { selector: 'p' })
    expect(noteDeContexte).toBeInTheDocument()
    const ajouterUneNoteDeContexte = within(sectionNoteDeContexte).getByRole('button', { name: 'Ajouter une note de contexte' })
    expect(ajouterUneNoteDeContexte).toHaveAttribute('type', 'button')
  })

  it('quand j’affiche une gouvernance avec une note de contexte, alors elle s’affiche avec sa section note de contexte repliée', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      noteDeContexte: {
        dateDeModification: epochTime,
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte: '<strong>titre note de contexte</strong><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p><p>un paragraphe avec du <b>bold</b>.</p>',
      },
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const sectionNoteDeContexte = screen.getByRole('region', { name: 'Note de contexte' })
    const enTeteNoteDeContexte = within(sectionNoteDeContexte).getByRole('banner')
    const titreNoteDeContexte = within(enTeteNoteDeContexte).getByRole('heading', { level: 2, name: 'Note de contexte' })
    expect(titreNoteDeContexte).toBeInTheDocument()
    const modifier = within(sectionNoteDeContexte).getByRole('button', { name: 'Modifier' })
    expect(modifier).toHaveAttribute('type', 'button')
    const auteurDeLaNote = screen.getAllByText('Modifié le 01/01/1970 par Jean Deschamps', { selector: 'p' })[0]
    expect(auteurDeLaNote).toBeInTheDocument()
    const contenuNoteDeContexte = within(sectionNoteDeContexte).getByRole('article')
    const noteDeContexteElement1 = within(contenuNoteDeContexte).getByText('titre note de contexte', { selector: 'strong' })
    expect(noteDeContexteElement1).toBeInTheDocument()
    const noteDeContexteElement2 = within(contenuNoteDeContexte).getAllByText(matchWithoutMarkup('un paragraphe avec du bold.'), { selector: 'p' })
    expect(noteDeContexteElement2[0]).toBeInTheDocument()
    const noteDeContexteElement3 = within(contenuNoteDeContexte).getAllByText('bold', { selector: 'b' })
    expect(noteDeContexteElement3[0]).toBeInTheDocument()
    const lirePlus = screen.getByRole('button', { name: 'Lire plus' })
    expect(lirePlus).toHaveAttribute('type', 'button')
    expect(lirePlus).toHaveClass('fr-icon-arrow-down-s-line')
  })

  it('quand j’affiche une gouvernance sans note de contexte et que je clique sur ajouter une note de contexte puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(
      gouvernanceReadModelFactory({ noteDeContexte: undefined }),
      epochTimePlusOneDay
    )
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    jouvreLeFormulairePourAjouterUneNoteDeContexte()
    const drawer = screen.getByRole('dialog', { name: 'Note de contexte' })
    jeFermeLeFormulairePourAjouterUneNoteDeContexte()

    // THEN
    expect(drawer).not.toBeVisible()
  })

  it('quand j’affiche une gouvernance avec une note de contexte, je peux la déplier', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      noteDeContexte: {
        dateDeModification: epochTime,
        nomAuteur: 'Deschamps',
        prenomAuteur: 'Jean',
        texte: '<strong>titre note de contexte</strong><p>un paragraphe avec du <b>bold</b>.</p>',
      },
    }), epochTimePlusOneDay)
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // WHEN
    const lirePlus = jeDeplieLaNoteDeContexte()

    // THEN
    expect(lirePlus).toHaveClass('fr-icon-arrow-up-s-line')
    const lireMoins = screen.getByRole('button', { name: 'Lire moins' })
    expect(lireMoins).toBeInTheDocument()
  })

  it('quand j’affiche une gouvernance avec un comité sans date, alors le comité est affiché sans date', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      comites: [
        {
          commentaire: 'commentaire',
          date: undefined,
          derniereEdition: epochTime,
          frequence: 'semestrielle',
          id: 1,
          nomEditeur: 'Tartempion',
          prenomEditeur: 'Martin',
          type: 'stratégique',
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const comites = screen.getByRole('table', { name: 'Comités' })
    const columns1Body = within(comites).getAllByRole('cell')
    expect(columns1Body[1].textContent).toBe('Comité stratégique')
  })

  it('quand j’affiche une gouvernance avec un comité dont la date est dans le passé, alors le comité est affiché sans date', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      comites: [
        {
          commentaire: 'commentaire',
          date: epochTime,
          derniereEdition: epochTime,
          frequence: 'semestrielle',
          id: 1,
          nomEditeur: 'Tartempion',
          prenomEditeur: 'Martin',
          type: 'stratégique',
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const comites = screen.getByRole('table', { name: 'Comités' })
    const columns1Body = within(comites).getAllByRole('cell')
    expect(columns1Body[1].textContent).toBe('Comité stratégique')
  })

  it('quand j’affiche une gouvernance avec un comité dont la date est le jour même ou dans le futur, alors le comité est affiché avec sa date', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      comites: [
        {
          commentaire: 'commentaire',
          date: epochTime,
          derniereEdition: epochTime,
          frequence: 'semestrielle',
          id: 1,
          nomEditeur: 'Tartempion',
          prenomEditeur: 'Martin',
          type: 'stratégique',
        },
      ],
    }), epochTime)

    // WHEN
    render(<Gouvernance gouvernanceViewModel={gouvernanceViewModel} />)

    // THEN
    const comites = screen.getByRole('table', { name: 'Comités' })
    const columns1Body = within(comites).getAllByRole('cell')
    expect(columns1Body[1].textContent).toBe('Comité stratégique : 01/01/1970')
  })

  function jOuvreLeFormulairePourAjouterUnComite(): void {
    presserLeBouton('Ajouter un comité')
  }

  function jeFermeLeFormulairePourAjouterUnComite(): void {
    presserLeBouton('Fermer le formulaire de création d’un comité')
  }

  function jouvreLeFormulairePourAjouterUneNoteDeContexte(): void {
    presserLeBouton('Ajouter une note de contexte')
  }

  function jeFermeLeFormulairePourAjouterUneNoteDeContexte(): void {
    presserLeBouton('Fermer le formulaire de création d’une note de contexte')
  }

  function jeDeplieLaNoteDeContexte(): HTMLElement {
    return presserLeBouton('Lire plus')
  }
})
