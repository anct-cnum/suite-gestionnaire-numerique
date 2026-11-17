import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import Resultats from './Resultats'
import { ResultatsViewModel } from '@/presenters/mesure-impact/resultatsPresenter'

describe('résultats d’une campagne de mesure d’impact', () => {
  it('affiche le titre, le total et les chiffres clés', () => {
    // WHEN
    render(<Resultats viewModel={viewModel} />)

    // THEN
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Résultats · Sicoval')
    expect(screen.getByRole('heading', { level: 2, name: 'Total : 148 réponses' })).toBeInTheDocument()
    const chiffresCles = screen.getByRole('list', { name: 'Chiffres clés' })
    expect(
      within(chiffresCles)
        .getAllByRole('listitem')
        .map((chiffre) => chiffre.textContent)
    ).toStrictEqual(['63 %se sentent plus à l’aise'])
  })

  it('filtre par un formulaire qui recharge la page avec les filtres choisis', () => {
    // WHEN
    render(<Resultats viewModel={viewModel} />)

    // THEN
    const formulaire = screen.getByRole('form', { name: 'Filtrer les résultats' })
    expect(formulaire).toHaveAttribute('method', 'get')
    expect(within(formulaire).getByRole('combobox', { name: /Territoire/ })).toBeInTheDocument()
    expect(within(formulaire).getByRole('combobox', { name: /Période/ })).toBeInTheDocument()
    expect(within(formulaire).getByRole('combobox', { name: /Canal de réponse/ })).toBeInTheDocument()
    expect(within(formulaire).getByText('Papier')).toBeInTheDocument()
    expect(within(formulaire).getByRole('button', { name: 'Afficher les résultats' })).toBeInTheDocument()
  })

  it('range les questions dans des onglets, le bilan ouvert par défaut', () => {
    // WHEN
    render(<Resultats viewModel={viewModel} />)

    // THEN
    const onglets = screen.getAllByRole('tab')
    expect(onglets.map((onglet) => onglet.textContent)).toStrictEqual([
      'Le bilan des accompagnements',
      'Le contexte des accompagnements',
    ])
    expect(onglets[0]).toHaveAttribute('aria-selected', 'true')
    expect(onglets[1]).toHaveAttribute('aria-selected', 'false')
  })

  it('donne pour chaque réponse sa part, et la base de la question', () => {
    // WHEN
    render(<Resultats viewModel={viewModel} />)

    // THEN
    const question = screen.getByRole('region', { name: 'Est-ce que les accompagnements ont répondu à vos attentes ?' })
    expect(within(question).getByText('Question 9')).toBeInTheDocument()
    expect(
      within(question)
        .getAllByRole('listitem')
        .map((ligne) => ligne.textContent)
    ).toStrictEqual(['Oui tout à fait55 %', 'Plutôt oui45 %'])
    expect(within(question).getByText('Base : 148 répondants')).toBeInTheDocument()
  })

  it('compare avant et après dans un tableau, avec le différentiel', () => {
    // WHEN
    render(<Resultats viewModel={viewModel} />)

    // THEN
    const question = screen.getByRole('region', { name: 'Comment vous sentiez-vous avec le numérique ?' })
    const tableau = within(question).getByRole('table')
    const lignes = within(tableau).getAllByRole('row').map(cellules)
    expect(lignes).toStrictEqual([
      ['Niveau', 'Avant', 'Après', 'Différentiel'],
      ['1 · Pas du tout à l’aise', '28 %', '11 %', '−17 pts'],
    ])
  })

  it('donne une grille en tableau, ligne par ligne', () => {
    // WHEN
    render(<Resultats viewModel={viewModel} />)

    // THEN
    const question = screen.getByRole('region', { name: 'Mieux maîtriser les équipements ?' })
    const lignes = within(within(question).getByRole('table')).getAllByRole('row').map(cellules)
    expect(lignes).toStrictEqual([
      ['Équipement', 'Plutôt oui', 'Plutôt non', 'Base'],
      ['Tablette', '75 %', '25 %', '4 répondants'],
    ])
  })
})

const viewModel: ResultatsViewModel = {
  chiffresCles: [{ libelle: 'se sentent plus à l’aise', valeur: '63 %' }],
  filtres: {
    canal: {
      options: [
        { label: 'Tous', value: '' },
        { label: 'Papier', value: 'papier' },
      ],
      valeur: 'papier',
    },
    codePostal: { options: [{ label: 'Tout le territoire', value: '' }], valeur: '' },
    mois: { options: [{ label: 'Toute la campagne', value: '' }], valeur: '' },
  },
  introduction: 'Pilote, collecte commencée le 16 novembre 2026.',
  lienCampagne: '/mesure-impact/sicoval',
  onglets: [
    {
      id: 'bilan',
      libelle: 'Le bilan des accompagnements',
      questions: [
        {
          base: 'Base : 148 répondants',
          cle: 'q9',
          lignes: [
            { libelle: 'Oui tout à fait', part: '55 %', pourcentage: 55 },
            { libelle: 'Plutôt oui', part: '45 %', pourcentage: 45 },
          ],
          surtitre: 'Question 9',
          titre: 'Est-ce que les accompagnements ont répondu à vos attentes ?',
          type: 'repartition',
        },
        {
          base: 'Base : 141 répondants ayant répondu aux deux questions',
          cle: 'q10-q11',
          niveaux: [
            {
              apres: '11 %',
              apresPourcentage: 11,
              avant: '28 %',
              avantPourcentage: 28,
              differentiel: '−17 pts',
              libelle: '1 · Pas du tout à l’aise',
            },
          ],
          surtitre: 'Questions 10 et 11',
          titre: 'Comment vous sentiez-vous avec le numérique ?',
          type: 'avant-apres',
        },
        {
          base: 'Base : par équipement',
          cle: 'q14',
          colonnes: ['Plutôt oui', 'Plutôt non'],
          lignes: [{ base: '4 répondants', libelle: 'Tablette', parts: ['75 %', '25 %'] }],
          surtitre: 'Question 14',
          titre: 'Mieux maîtriser les équipements ?',
          type: 'grille',
        },
      ],
    },
    { id: 'contexte', libelle: 'Le contexte des accompagnements', questions: [] },
  ],
  titre: 'Résultats · Sicoval',
  titreFilAriane: 'Sicoval',
  total: 'Total : 148 réponses',
}

function cellules(ligne: HTMLElement): ReadonlyArray<null | string> {
  return [
    ...within(ligne).queryAllByRole('columnheader'),
    ...within(ligne).queryAllByRole('rowheader'),
    ...within(ligne).queryAllByRole('cell'),
  ].map((cellule) => cellule.textContent)
}
