import { describe, expect, it } from 'vitest'

import { resultatsPresenter } from './resultatsPresenter'
import { ResultatsReadModel } from '@/use-cases/mesure-impact/RecupererLesResultats'

describe('résultats d’une campagne de mesure d’impact', () => {
  it('présente le titre, le total, les filtres et leur valeur', () => {
    // WHEN
    const viewModel = resultatsPresenter({ ...readModel, filtres: { canal: 'papier', mois: '2026-11' } })

    // THEN
    expect(viewModel.titre).toBe('Résultats · Sicoval')
    expect(viewModel.introduction).toBe('Pilote Sicoval 2026, collecte commencée le 16 novembre 2026.')
    expect(viewModel.lienCampagne).toBe('/mesure-impact/sicoval')
    expect(viewModel.total).toBe('Total : 148 réponses')
    expect(viewModel.filtres).toStrictEqual({
      canal: {
        options: [
          { label: 'Tous', value: '' },
          { label: 'En ligne', value: 'en-ligne' },
          { label: 'Papier', value: 'papier' },
          { label: 'Téléphone', value: 'telephone' },
        ],
        valeur: 'papier',
      },
      codePostal: {
        options: [
          { label: 'Tout le territoire', value: '' },
          { label: '31320', value: '31320' },
          { label: '31670', value: '31670' },
        ],
        valeur: '',
      },
      mois: {
        options: [
          { label: 'Toute la campagne', value: '' },
          { label: 'Novembre 2026', value: '2026-11' },
          { label: 'Décembre 2026', value: '2026-12' },
        ],
        valeur: '2026-11',
      },
    })
  })

  it('présente les chiffres clés en pourcentage, ou un tiret sans réponse', () => {
    // WHEN
    const { chiffresCles } = resultatsPresenter(readModel)

    // THEN
    expect(chiffresCles).toStrictEqual([
      { libelle: 'se sentent plus à l’aise avec le numérique après leurs accompagnements', valeur: '63 %' },
      { libelle: 'arrivent à faire de nouvelles choses avec le numérique', valeur: '–' },
      { libelle: 'ont le sentiment d’avoir progressé', valeur: '94 %' },
    ])
  })

  it('range les questions en onglets : le bilan, le contexte, les personnes accompagnées', () => {
    // WHEN
    const { onglets } = resultatsPresenter(readModel)

    // THEN
    expect(onglets.map(({ id, libelle }) => ({ id, libelle }))).toStrictEqual([
      { id: 'bilan', libelle: 'Le bilan des accompagnements' },
      { id: 'contexte', libelle: 'Le contexte des accompagnements' },
      { id: 'vous', libelle: 'Les personnes accompagnées' },
    ])
    expect(onglets[0].questions.map((question) => question.surtitre)).toStrictEqual([
      'Question 9',
      'Questions 10 et 11',
      'Question 13',
      'Question 14',
    ])
    expect(onglets[1].questions.map((question) => question.surtitre)).toStrictEqual(['Question 1'])
  })

  it('une question à choix unique garde l’ordre de ses réponses ; sa base est le nombre de répondants', () => {
    // WHEN
    const question = resultatsPresenter(readModel).onglets[0].questions[0]

    // THEN
    expect(question).toStrictEqual({
      base: 'Base : 148 répondants',
      cle: 'q9',
      lignes: [
        { libelle: 'Oui tout à fait', part: '55 %', pourcentage: 55 },
        { libelle: 'Plutôt oui', part: '34 %', pourcentage: 34 },
        { libelle: 'Plutôt non', part: '7 %', pourcentage: 7 },
        { libelle: 'Non pas du tout', part: '3 %', pourcentage: 3 },
      ],
      surtitre: 'Question 9',
      titre: 'Est-ce que les accompagnements à l’utilisation du numérique ont répondu à vos attentes ?',
      type: 'repartition',
    })
  })

  it('une question à choix multiple est triée par fréquence ; sa base dit la condition et les réponses multiples', () => {
    // WHEN
    const question = resultatsPresenter(readModel).onglets[0].questions[2]

    // THEN
    expect(question).toStrictEqual({
      base: 'Base : 2 répondants ayant répondu « Oui tout à fait » ou « Plutôt oui » à la question 12 · plusieurs réponses possibles',
      cle: 'q13',
      lignes: [
        { libelle: 'Me soigner', part: '100 %', pourcentage: 100 },
        { libelle: 'Travailler', part: '50 %', pourcentage: 50 },
        { libelle: 'Autre', part: '0 %', pourcentage: 0 },
      ],
      surtitre: 'Question 13',
      titre: 'Dans quels domaines en particulier ?',
      type: 'repartition',
    })
  })

  it('compare avant et après les accompagnements, avec le différentiel en points', () => {
    // WHEN
    const question = resultatsPresenter(readModel).onglets[0].questions[1]

    // THEN
    expect(question).toStrictEqual({
      base: 'Base : 4 répondants ayant répondu aux deux questions · différentiel = après − avant, en points',
      cle: 'q10-q11',
      niveaux: [
        {
          apres: '0 %',
          apresPourcentage: 0,
          avant: '75 %',
          avantPourcentage: 75,
          differentiel: '−75 pts',
          libelle: '1 · Pas du tout à l’aise',
        },
        {
          apres: '25 %',
          apresPourcentage: 25,
          avant: '25 %',
          avantPourcentage: 25,
          differentiel: '0 pt',
          libelle: '2',
        },
        { apres: '0 %', apresPourcentage: 0, avant: '0 %', avantPourcentage: 0, differentiel: '0 pt', libelle: '3' },
        { apres: '0 %', apresPourcentage: 0, avant: '0 %', avantPourcentage: 0, differentiel: '0 pt', libelle: '4' },
        {
          apres: '75 %',
          apresPourcentage: 75,
          avant: '0 %',
          avantPourcentage: 0,
          differentiel: '+75 pts',
          libelle: '5 · Très à l’aise',
        },
      ],
      surtitre: 'Questions 10 et 11',
      titre: 'Comment vous sentiez-vous avec le numérique, avant et après ces accompagnements ?',
      type: 'avant-apres',
    })
  })

  it('une grille donne la part de chaque réponse par ligne, avec sa base', () => {
    // WHEN
    const question = resultatsPresenter(readModel).onglets[0].questions[3]

    // THEN
    expect(question).toStrictEqual({
      base: 'Base : par équipement, les répondants qui l’ont utilisé pendant les accompagnements',
      cle: 'q14',
      colonnes: ['Plutôt oui', 'Plutôt non'],
      lignes: [
        { base: '4 répondants', libelle: 'Tablette', parts: ['75 %', '25 %'] },
        { base: 'Aucun répondant', libelle: 'Imprimante 3D', parts: ['–', '–'] },
      ],
      surtitre: 'Question 14',
      titre: 'Diriez-vous que les accompagnements vous ont permis de mieux maîtriser les équipements suivants ?',
      type: 'grille',
    })
  })
})

const readModel: ResultatsReadModel = {
  campagne: {
    identifiantPublic: 'sicoval',
    libelleTerritoire: 'Sicoval',
    nom: 'Pilote Sicoval 2026',
    ouverture: new Date('2026-11-16T09:00:00.000Z'),
  },
  filtres: {},
  optionsDeFiltre: { codesPostaux: ['31320', '31670'], mois: ['2026-11', '2026-12'] },
  parties: [
    { code: 'contexte', intro: '', libelle: 'Le contexte', titre: '' },
    { code: 'bilan', intro: '', libelle: 'Le bilan', titre: '' },
    { code: 'vous', intro: '', libelle: 'À propos de vous', titre: '' },
  ],
  resultats: {
    chiffresCles: {
      nouvellesChoses: { base: 0, nombre: 0 },
      plusALAise: { base: 100, nombre: 63 },
      progres: { base: 50, nombre: 47 },
    },
    questions: [
      {
        base: 3,
        code: 'q1',
        condition: undefined,
        multiple: true,
        numero: 1,
        options: [{ code: 'travailler', libelle: 'Travailler', nombre: 1 }],
        partie: 'contexte',
        titre: 'Pourquoi le numérique ?',
        type: 'repartition',
      },
      {
        base: 148,
        code: 'q9',
        condition: undefined,
        multiple: false,
        numero: 9,
        options: [
          { code: 'oui-tout-a-fait', libelle: 'Oui tout à fait', nombre: 81 },
          { code: 'plutot-oui', libelle: 'Plutôt oui', nombre: 51 },
          { code: 'plutot-non', libelle: 'Plutôt non', nombre: 11 },
          { code: 'non-pas-du-tout', libelle: 'Non pas du tout', nombre: 5 },
        ],
        partie: 'bilan',
        titre: 'Est-ce que les accompagnements à l’utilisation du numérique ont répondu à vos attentes ?',
        type: 'repartition',
      },
      {
        base: 4,
        codes: ['q10', 'q11'],
        niveaux: [
          { apres: 0, avant: 3, niveau: '1' },
          { apres: 1, avant: 1, niveau: '2' },
          { apres: 0, avant: 0, niveau: '3' },
          { apres: 0, avant: 0, niveau: '4' },
          { apres: 3, avant: 0, niveau: '5' },
        ],
        numeros: [10, 11],
        partie: 'bilan',
        poles: { maximum: 'Très à l’aise', minimum: 'Pas du tout à l’aise' },
        titres: ['Avant ?', 'Après ?'],
        type: 'avant-apres',
      },
      {
        base: 2,
        code: 'q13',
        condition: { numero: 12, reponses: ['Oui tout à fait', 'Plutôt oui'] },
        multiple: true,
        numero: 13,
        options: [
          { code: 'travailler', libelle: 'Travailler', nombre: 1 },
          { code: 'me-soigner', libelle: 'Me soigner', nombre: 2 },
          { code: 'autre', libelle: 'Autre', nombre: 0 },
        ],
        partie: 'bilan',
        titre: 'Dans quels domaines en particulier ?',
        type: 'repartition',
      },
      {
        code: 'q14',
        lignes: [
          {
            base: 4,
            code: 'tablette',
            libelle: 'Tablette',
            options: [
              { code: 'plutot-oui', libelle: 'Plutôt oui', nombre: 3 },
              { code: 'plutot-non', libelle: 'Plutôt non', nombre: 1 },
            ],
          },
          {
            base: 0,
            code: 'imprimante-3d',
            libelle: 'Imprimante 3D',
            options: [
              { code: 'plutot-oui', libelle: 'Plutôt oui', nombre: 0 },
              { code: 'plutot-non', libelle: 'Plutôt non', nombre: 0 },
            ],
          },
        ],
        numero: 14,
        partie: 'bilan',
        titre: 'Diriez-vous que les accompagnements vous ont permis de mieux maîtriser les équipements suivants ?',
        type: 'grille',
      },
    ],
    total: 148,
  },
}
