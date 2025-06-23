import { fireEvent, screen, within } from '@testing-library/react'

import Gouvernance from './Gouvernance'
import { matchWithoutMarkup, renderComponent } from '../testHelper'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { epochTime, epochTimePlusOneDay } from '@/shared/testHelper'
import { gouvernanceReadModelFactory } from '@/use-cases/testHelper'

describe('gouvernance', () => {
  it('quand j’affiche une gouvernance, alors elle s’affiche avec son titre et son sous titre', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ departement: 'Rhône' }), epochTimePlusOneDay)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Inclusion numérique · Rhône' })
    expect(titre).toBeInTheDocument()
    const sousTitre = screen.getByText('Retrouvez la gouvernance établie au sein d’un département, sa composition et ses feuilles de route.', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()
  })

  it('quand j’affiche une gouvernance sans comité, alors elle s’affiche avec sa section lui demandant d’en ajouter un', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ comites: undefined, departement: 'Rhône' }), epochTimePlusOneDay)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

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

    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // WHEN
    jOuvreLeFormulairePourAjouterUnComite()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un comité' })
    expect(drawer).toBeVisible()
  })

  it('quand j’affiche une gouvernance sans comité et que je clique sur ajouter un comité puis que je clique sur fermer, alors le drawer se ferme', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ comites: undefined, departement: 'Rhône' }), epochTimePlusOneDay)
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // WHEN
    jOuvreLeFormulairePourAjouterUnComite()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Ajouter un comité' })
    const fermer = jeFermeLeFormulairePourAjouterUnComite()

    // THEN
    expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterComiteId')
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
          id: 2,
          nomEditeur: 'Tartempion',
          prenomEditeur: 'Martin',
          type: 'technique',
        },
      ],
    }), epochTime)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // THEN
    const comitologie = screen.getByRole('region', { name: 'Comitologie' })
    const enTeteComitologie = within(comitologie).getByRole('banner')
    const titreComitologie = within(enTeteComitologie).getByRole('heading', { level: 2, name: 'Comitologie' })
    expect(titreComitologie).toBeInTheDocument()
    const ajouter = within(comitologie).getByRole('button', { name: 'Ajouter' })
    expect(ajouter).toHaveAttribute('type', 'button')
    const comites = screen.getByRole('table', { name: 'Comités' })
    const [head, body] = within(comites).getAllByRole('rowgroup')
    expect(head).toHaveClass('fr-sr-only')
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

  it('quand j’affiche une gouvernance avec au moins un membre, alors elle s’affiche avec son résumé et sa section membre', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      syntheseMembres: {
        candidats: 0,
        coporteurs: [
          {
            contactReferent: {
              denomination: 'Contact politique de la collectivité',
              mailContact: 'julien.deschamps@rhones.gouv.fr',
              nom: 'Henrich',
              poste: 'chargé de mission',
              prenom: 'Laetitia',
            },
            contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
            feuillesDeRoute: [
              { nom: 'Feuille de route inclusion', uid: '0' },
              { nom: 'Feuille de route numérique du Rhône', uid: '1' }],
            links: {},
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            telephone: '+33 4 45 00 45 00',
            totalMontantsSubventionsAccordees: 0,
            type: 'Préfecture départementale',
            uid: 'membreId',
          },
          {
            contactReferent: {
              denomination: 'Contact politique de la collectivité',
              mailContact: 'didier.durand@exemple.com',
              nom: 'Didier',
              poste: 'chargé de mission',
              prenom: 'Durant',
            },
            feuillesDeRoute: [{ nom: 'Feuille de route inclusion', uid: '2' }],
            links: {},
            nom: 'Département du Rhône',
            roles: ['coporteur', 'cofinanceur'],
            telephone: '+33 4 45 00 45 01',
            totalMontantsSubventionsAccordees: 0,
            type: 'Conseil départemental',
            uid: 'membreId2',
          },
        ],
        total: 2,
      },
    }), epochTimePlusOneDay)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('2 membres de la gouvernance'), { selector: 'p' })
    expect(resume).toBeInTheDocument()
    const lienResume = screen.getByRole('link', { name: 'Voir les membres' })
    expect(lienResume).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membres')

    const sectionMembre = screen.getByRole('region', { name: '2 membres' })
    const enTeteMembre = within(sectionMembre).getByRole('banner')
    const titreMembre = within(enTeteMembre).getByRole('heading', { level: 2, name: '2 membres' })
    expect(titreMembre).toBeInTheDocument()
    const sousTitreMembre = within(enTeteMembre).getByText('2 co-porteurs, 0 candidat', { selector: 'p' })
    expect(sousTitreMembre).toBeInTheDocument()
    const gerer = within(sectionMembre).getByRole('link', { name: 'Gérer' })
    expect(gerer).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/membres')
    const membres = screen.getByRole('table', { name: 'Membres' })
    const [head, body] = within(membres).getAllByRole('rowgroup')
    expect(head).toHaveClass('fr-sr-only')
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
    expect(columns1Body[2].textContent).toBe('Préfecture départementale')
    expect(columns1Body[3].textContent).toBe('Co-porteur ')
    const columns2Body = within(rowsBody[1]).getAllByRole('cell')
    expect(columns2Body).toHaveLength(4)
    const membreDepartementDuRhone = within(columns2Body[1]).getByRole('button', { name: 'Département du Rhône' })
    expect(membreDepartementDuRhone).toHaveAttribute('type', 'button')
    expect(membreDepartementDuRhone).toHaveAttribute('aria-controls', 'drawerMembreId')
    expect(columns2Body[1].textContent).toBe('Département du Rhône')
    expect(columns2Body[2].textContent).toBe('Conseil départemental')
    expect(columns2Body[3].textContent).toBe('Co-porteur Co-financeur ')
  })

  it('quand j’affiche une gouvernance avec qu’un membre, alors elle s’affiche avec son résumé au singulier et certains titres au singulier', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      syntheseMembres: {
        candidats: 0,
        coporteurs: [
          {
            contactReferent: {
              denomination: 'Contact politique de la collectivité',
              mailContact: 'julien.deschamps@rhones.gouv.fr',
              nom: 'Henrich',
              poste: 'chargé de mission',
              prenom: 'Laetitia',
            },
            contactTechnique: 'Simon.lagrange@rhones.gouv.fr',
            feuillesDeRoute: [
              { nom: 'Feuille de route inclusion', uid: '0' },
              { nom: 'Feuille de route numérique du Rhône', uid: '1' }],
            links: { plusDetails: '/' },
            nom: 'Préfecture du Rhône',
            roles: ['coporteur'],
            telephone: '+33 4 45 00 45 00',
            totalMontantsSubventionsAccordees: 0,
            type: 'Préfecture départementale',
            uid: 'membreId',
          },
        ],
        total: 1,
      },
    }), epochTimePlusOneDay)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('1 membre de la gouvernance'), { selector: 'p' })
    expect(resume).toBeInTheDocument()

    const sectionMembre = screen.getByRole('region', { name: '1 membre' })
    const enTeteMembre = within(sectionMembre).getByRole('banner')
    const titreMembre = within(enTeteMembre).getByRole('heading', { level: 2, name: '1 membre' })
    expect(titreMembre).toBeInTheDocument()
    const sousTitreMembre = within(enTeteMembre).getByText('1 co-porteur, 0 candidat', { selector: 'p' })
    expect(sousTitreMembre).toBeInTheDocument()
  })

  it('quand j’affiche une gouvernance sans feuille de route, alors elle s’affiche avec son résumé à 0 et sa section lui demandant d’en ajouter une', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({ departement: 'Rhône', feuillesDeRoute: [] }), epochTimePlusOneDay)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

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
    const feuilleDeRoute = within(contenuFeuilleDeRoute[0]).getByText('Cliquez sur le bouton gérer les feuilles de route pour définir votre première feuille de route.', { selector: 'p' })
    expect(feuilleDeRoute).toBeInTheDocument()
    const ajouterDesFeuilleDeRoutes = within(sectionFeuilleDeRoute).getByRole('link', { name: 'Gérer les feuilles de route' })
    expect(ajouterDesFeuilleDeRoutes).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuilles-de-route')
  })

  it('quand j’affiche une gouvernance avec au moins une feuille de route, alors elle s’affiche avec son résumé et sa section feuille de route', () => {
    // GIVEN
    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModelFactory({
      feuillesDeRoute: [
        {
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', uid: '0' }],
          beneficiairesSubventionAccordee: [],
          budgetGlobal: 145_000,
          montantSubventionAccordee: 105_000,
          montantSubventionDemandee: 120_000,
          nom: 'Feuille de route inclusion',
          porteur: { nom: 'Préfecture du Rhône', uid: '0' },
          totalActions: 3,
          uid: 'feuilleDeRouteFooId1',
        },
        {
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', uid: '2' }],
          beneficiairesSubventionAccordee: [],
          budgetGlobal: 88_030,
          montantSubventionAccordee: 38_030,
          montantSubventionDemandee: 50_000,
          nom: 'Feuille de route numérique du Rhône',
          porteur: { nom: 'Préfecture du Rhône', uid: '1' },
          totalActions: 1,
          uid: 'feuilleDeRouteFooId2',
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('2 feuilles de route territoriale'), { selector: 'p' })
    expect(resume).toBeInTheDocument()
    const lienResume = screen.getByRole('link', { name: 'Voir les feuilles de route' })
    expect(lienResume).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuilles-de-route')

    const sectionFeuilleDeRoute = screen.getByRole('region', { name: '2 feuilles de route' })
    const enTeteFeuilleDeRoute = within(sectionFeuilleDeRoute).getByRole('banner')
    const titreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByRole('heading', { level: 2, name: '2 feuilles de route' })
    expect(titreFeuilleDeRoute).toBeInTheDocument()
    const sousTitreFeuilleDeRoute = within(enTeteFeuilleDeRoute).getByText('2 feuilles de route, 233 030 €', { selector: 'p' })
    expect(sousTitreFeuilleDeRoute).toBeInTheDocument()
    const gerer = within(sectionFeuilleDeRoute).getByRole('link', { name: 'Gérer' })
    expect(gerer).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuilles-de-route')
    const FeuillesDeRoute = screen.getByRole('table', { name: 'Feuilles de route' })
    const [head, body] = within(FeuillesDeRoute).getAllByRole('rowgroup')
    expect(head).toHaveClass('fr-sr-only')
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
          beneficiairesSubvention: [{ nom: 'Préfecture du Rhône', uid: '0' }],
          beneficiairesSubventionAccordee: [],
          budgetGlobal: 145_000,
          montantSubventionAccordee: 100_000,
          montantSubventionDemandee: 115_000,
          nom: 'Feuille de route inclusion',
          porteur: { nom: 'Préfecture du Rhône', uid: '2' },
          totalActions: 3,
          uid: 'feuilleDeRouteFooId',
        },
      ],
    }), epochTimePlusOneDay)

    // WHEN
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // THEN
    const resume = screen.getByText(matchWithoutMarkup('1 feuille de route territoriale'), { selector: 'p' })
    expect(resume).toBeInTheDocument()
    const lienResume = screen.getByRole('link', { name: 'Voir la feuille de route' })
    expect(lienResume).toHaveAttribute('href', '/gouvernance/gouvernanceFooId/feuilles-de-route')

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
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

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
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

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
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // WHEN
    jouvreLeFormulairePourAjouterUneNoteDeContexte()
    const drawer = screen.getByRole('dialog', { hidden: false, name: 'Note de contexte' })
    const fermer = jeFermeLeFormulairePourAjouterUneNoteDeContexte()

    // THEN
    expect(fermer).toHaveAttribute('aria-controls', 'drawerAjouterNoteDeContexteId')
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
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

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
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

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
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

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
    renderComponent(<Gouvernance />, undefined, gouvernanceViewModel)

    // THEN
    const comites = screen.getByRole('table', { name: 'Comités' })
    const columns1Body = within(comites).getAllByRole('cell')
    expect(columns1Body[1].textContent).toBe('Comité stratégique : 01/01/1970')
  })

  function jOuvreLeFormulairePourAjouterUnComite(): void {
    presserLeBouton('Ajouter un comité')
  }

  function jeFermeLeFormulairePourAjouterUnComite(): HTMLElement {
    return presserLeBouton('Fermer le formulaire de création d’un comité')
  }

  function jouvreLeFormulairePourAjouterUneNoteDeContexte(): void {
    presserLeBouton('Ajouter une note de contexte')
  }

  function jeFermeLeFormulairePourAjouterUneNoteDeContexte(): HTMLElement {
    return presserLeBouton('Fermer le formulaire de création d’une note de contexte')
  }

  function jeDeplieLaNoteDeContexte(): HTMLElement {
    return presserLeBouton('Lire plus')
  }

  function presserLeBouton(name: string): HTMLElement {
    const button = screen.getByRole('button', { name })
    fireEvent.click(button)
    return button
  }
})
