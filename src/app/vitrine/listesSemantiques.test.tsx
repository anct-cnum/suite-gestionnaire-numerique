import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import LieuxPage from './lieux/page'
import VitrineHomePage from './page'
import EtatDesLieux from '@/components/TableauDeBord/EtatDesLieux/EtatDesLieux'
import GouvernancePref from '@/components/TableauDeBord/Gouvernance/GouvernancePref'
import { renderComponent } from '@/components/testHelper'
import DetailActionVitrine from '@/components/vitrine/FeuilleDeRoute/DetailActionVitrine'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { feuillesDeRouteReadModelFactory } from '@/use-cases/testHelper'

describe('listes et paragraphes sémantiques de la vitrine (RGAA 8.9 et 9.3)', () => {
  it('accueil : les logos des partenaires forment une liste', () => {
    // WHEN
    renderComponent(<VitrineHomePage />)

    // THEN
    const liste = listeContenant((liste) => within(liste).queryByRole('img', { name: 'MedNum' }) !== null)
    const logos = within(liste)
      .getAllByRole('listitem')
      .map((element) => within(element).getByRole('img').getAttribute('alt'))
    expect(logos).toStrictEqual([
      'La Coop de la médiation numérique',
      'Cartographie Nationale',
      'Aidants Connect',
      'Conseillers Numériques',
      'MedNum',
      'Data Inclusion',
    ])
  })

  it('accueil : chaque note de bas de page est un paragraphe distinct', () => {
    // WHEN
    renderComponent(<VitrineHomePage />)

    // THEN
    const premiereNote = screen.getByText('* Baromètre du numérique, 2024.')
    expect(premiereNote.tagName).toBe('P')
    const secondeNote = screen.getByText(/^\*\* ANCT, CREDOC/)
    expect(secondeNote.tagName).toBe('P')
  })

  it.each([
    {
      intention: 'exemples d’intégration',
      titres: ['Hub Normandie', 'Cartographie nationale'],
    },
    {
      intention: 'avantages',
      titres: ['Orientation', 'Standardisation', 'Mise à jour', 'Visibilité'],
    },
    {
      intention: 'ressources Les Bases',
      titres: [
        'Diffuser la cartographie nationale au sein de mon réseau',
        'Collectivité : Comment prendre en main la cartographie ?',
        "Évolution du standard national des lieux d'inclusion numérique",
      ],
    },
  ])('lieux : les $intention forment une liste dont chaque élément porte un titre', ({ titres }) => {
    // WHEN
    renderComponent(<LieuxPage />)

    // THEN
    const liste = listeContenant((liste) => within(liste).queryByRole('heading', { name: titres[0] }) !== null)
    const elements = within(liste).getAllByRole('listitem')
    expect(elements.map((element) => within(element).getByRole('heading', { level: 3 }).textContent)).toStrictEqual(
      titres
    )
  })

  it('synthèse : les cartes chiffrées de l’état des lieux forment une liste', () => {
    // WHEN
    render(
      <EtatDesLieux
        accompagnementsRealisesPromise={new Promise(() => undefined)}
        afficherLienLieux={false}
        carte={<div />}
        lieuxInclusionViewModel={{ departement: '69', nombreLieux: '1 234' }}
        mediateursEtAidantsViewModel={{ departement: '69', total: '567' }}
      />
    )

    // THEN
    const liste = listeContenant((liste) => within(liste).queryByText('1 234') !== null)
    expect(within(liste).getAllByRole('listitem')).toHaveLength(3)
  })

  it('gouvernance : les cartes chiffrées forment une liste', () => {
    // WHEN
    render(
      <GouvernancePref
        gouvernanceViewModel={{ feuilleDeRoute: { action: 4, total: 2 }, membre: { coporteur: 3, total: 12 } }}
      />
    )

    // THEN
    const liste = listeContenant((liste) => within(liste).queryByText('Membres de la gouvernance') !== null)
    const cartes = within(liste).getAllByRole('listitem')
    expect(cartes).toHaveLength(2)
    expect(within(cartes[1]).getByText('Feuilles de route déposées')).toBeInTheDocument()
  })

  it('gouvernance en erreur : les cartes chiffrées forment une liste', () => {
    // WHEN
    render(<GouvernancePref gouvernanceViewModel={{ message: 'erreur', type: 'error' }} />)

    // THEN
    const liste = listeContenant((liste) => within(liste).queryByText('Membres de la gouvernance') !== null)
    expect(within(liste).getAllByRole('listitem')).toHaveLength(3)
  })

  it('feuille de route : le détail d’une action est une liste de couples libellé/valeur, sans doublon de description', () => {
    // GIVEN
    const action = feuillesDeRoutePresenter(feuillesDeRouteReadModelFactory()).feuillesDeRoute[0].actions[0]

    // WHEN
    render(<DetailActionVitrine action={action} labelId="titre-action" />)

    // THEN
    const libelles = screen.getAllByRole('term').map((libelle) => libelle.textContent)
    expect(libelles).toStrictEqual([
      "Porteur de l'action",
      "Budget total de l'action",
      "Description de l'action",
      'Bénéficiaires des subventions',
    ])
    expect(screen.getAllByRole('definition')).toHaveLength(4)
    expect(screen.queryByText("Contexte de l'action")).not.toBeInTheDocument()
  })
})

function listeContenant(contient: (liste: HTMLElement) => boolean): HTMLElement {
  const liste = screen.getAllByRole('list').find(contient)
  if (liste === undefined) {
    throw new Error('aucune liste ne contient l’élément attendu')
  }
  return liste
}
