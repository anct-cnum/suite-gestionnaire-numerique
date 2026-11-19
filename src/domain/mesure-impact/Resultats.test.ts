import { describe, expect, it } from 'vitest'

import { Canal, Contenu, Questionnaire } from './Questionnaire'
import { questionnaireDeVersion } from './questionnaires'
import { calculerLesResultats, filtrerLesReponses, optionsDeFiltre, ReponseEnregistree } from './Resultats'

describe('résultats d’une campagne de mesure d’impact', () => {
  it('compte les réponses', () => {
    // WHEN
    const resultats = calculerLesResultats(socle(), [uneReponse({}), uneReponse({})])

    // THEN
    expect(resultats.total).toBe(2)
  })

  it('rapporte une question à choix unique aux personnes qui y ont répondu, options dans l’ordre du questionnaire', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q9: { valeur: 'plutot-oui' } }),
      uneReponse({ q9: { valeur: 'oui-tout-a-fait' } }),
      uneReponse({ q9: { valeur: 'oui-tout-a-fait' } }),
      uneReponse({}, 'papier'),
    ]

    // WHEN
    const q9 = repartition(calculerLesResultats(socle(), reponses), 'q9')

    // THEN
    expect(q9).toStrictEqual({
      base: 3,
      code: 'q9',
      condition: undefined,
      multiple: false,
      numero: 9,
      options: [
        { code: 'oui-tout-a-fait', libelle: 'Oui tout à fait', nombre: 2 },
        { code: 'plutot-oui', libelle: 'Plutôt oui', nombre: 1 },
        { code: 'plutot-non', libelle: 'Plutôt non', nombre: 0 },
        { code: 'non-pas-du-tout', libelle: 'Non pas du tout', nombre: 0 },
      ],
      partie: 'bilan',
      titre: 'Est-ce que les accompagnements à l’utilisation du numérique ont répondu à vos attentes ?',
      type: 'repartition',
    })
  })

  it('rapporte une question conditionnelle aux personnes à qui elle a été posée, et dit la condition', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q12: { valeur: 'oui-tout-a-fait' }, q13: { valeur: ['travailler', 'me-soigner'] } }),
      uneReponse({ q12: { valeur: 'plutot-oui' }, q13: { valeur: ['travailler'] } }),
      uneReponse({ q12: { valeur: 'pas-du-tout' } }),
    ]

    // WHEN
    const q13 = repartition(calculerLesResultats(socle(), reponses), 'q13')

    // THEN
    expect(q13.base).toBe(2)
    expect(q13.multiple).toBe(true)
    expect(q13.condition).toStrictEqual({ numero: 12, reponses: ['Oui tout à fait', 'Plutôt oui'] })
    expect(q13.options.find((option) => option.code === 'travailler')?.nombre).toBe(2)
    expect(q13.options.find((option) => option.code === 'me-soigner')?.nombre).toBe(1)
  })

  it('compare avant et après les accompagnements sur les personnes qui ont répondu aux deux questions', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q10: { valeur: '1' }, q11: { valeur: '3' } }),
      uneReponse({ q10: { valeur: '2' }, q11: { valeur: '3' } }),
      uneReponse({ q10: { valeur: '4' } }),
    ]

    // WHEN
    const resultats = calculerLesResultats(socle(), reponses)

    // THEN
    expect(resultats.questions.find((question) => question.type === 'avant-apres')).toStrictEqual({
      base: 2,
      codes: ['q10', 'q11'],
      niveaux: [
        { apres: 0, avant: 1, niveau: '1' },
        { apres: 0, avant: 1, niveau: '2' },
        { apres: 2, avant: 0, niveau: '3' },
        { apres: 0, avant: 0, niveau: '4' },
        { apres: 0, avant: 0, niveau: '5' },
      ],
      numeros: [10, 11],
      partie: 'bilan',
      poles: { maximum: 'Très à l’aise', minimum: 'Pas du tout à l’aise' },
      titres: [
        'Avant ces accompagnements, comment vous sentiez-vous avec le numérique, sur une échelle de 1 à 5 ?',
        'Et aujourd’hui, après ces accompagnements, comment vous sentez-vous avec le numérique, sur une échelle de 1 à 5 ?',
      ],
      type: 'avant-apres',
    })
    expect(resultats.questions.some((question) => question.type !== 'avant-apres' && question.code === 'q11')).toBe(
      false
    )
  })

  it('rapporte chaque ligne d’une grille aux personnes qui y ont répondu', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q14: { valeur: { tablette: 'plutot-oui', 'telephone-portable': 'plutot-non' } } }),
      uneReponse({ q14: { valeur: { tablette: 'plutot-oui' } } }),
    ]

    // WHEN
    const q14 = calculerLesResultats(socle(), reponses).questions.find(
      (question) => question.type === 'grille' && question.code === 'q14'
    )

    // THEN
    const lignes = q14?.type === 'grille' ? q14.lignes : []
    expect(lignes.find((ligne) => ligne.code === 'tablette')).toStrictEqual({
      base: 2,
      code: 'tablette',
      libelle: 'Tablette',
      options: [
        { code: 'plutot-oui', libelle: 'Plutôt oui', nombre: 2 },
        { code: 'plutot-non', libelle: 'Plutôt non', nombre: 0 },
      ],
    })
    expect(lignes.find((ligne) => ligne.code === 'telephone-portable')?.base).toBe(1)
    expect(lignes.find((ligne) => ligne.code === 'imprimante-3d')?.base).toBe(0)
  })

  it('rapporte le code postal par valeur donnée', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q26: { valeur: '31670' } }),
      uneReponse({ q26: { valeur: '31320' } }),
      uneReponse({ q26: { valeur: '31670' } }),
    ]

    // WHEN
    const q26 = repartition(calculerLesResultats(socle(), reponses), 'q26')

    // THEN
    expect(q26.base).toBe(3)
    expect(q26.options).toStrictEqual([
      { code: '31320', libelle: '31320', nombre: 1 },
      { code: '31670', libelle: '31670', nombre: 2 },
    ])
  })

  it('donne les chiffres clés : plus à l’aise après, de nouvelles choses, le sentiment d’avoir progressé', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q10: { valeur: '1' }, q11: { valeur: '4' }, q12: { valeur: 'plutot-oui' } }),
      uneReponse({ q10: { valeur: '3' }, q11: { valeur: '3' }, q12: { valeur: 'plutot-non' } }),
      uneReponse({ q15: { valeur: 'oui-tout-a-fait' } }),
    ]

    // WHEN
    const { chiffresCles } = calculerLesResultats(socle(), reponses)

    // THEN
    expect(chiffresCles).toStrictEqual({
      nouvellesChoses: { base: 1, nombre: 1 },
      plusALAise: { base: 2, nombre: 1 },
      progres: { base: 2, nombre: 1 },
    })
  })

  it('ne garde que les réponses du canal, du mois et du code postal choisis', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q26: { valeur: '31670' } }, 'papier', '2026-11-20T10:00:00.000Z'),
      uneReponse({ q26: { valeur: '31670' } }, 'en-ligne', '2026-11-20T10:00:00.000Z'),
      uneReponse({ q26: { valeur: '31320' } }, 'papier', '2026-11-20T10:00:00.000Z'),
      // Mois à l'heure de Paris : 23 h le 30 novembre, puis minuit le 1er décembre
      uneReponse({ q26: { valeur: '31670' } }, 'papier', '2026-11-30T22:00:00.000Z'),
      uneReponse({ q26: { valeur: '31670' } }, 'papier', '2026-11-30T23:00:00.000Z'),
    ]

    // WHEN
    const filtrees = filtrerLesReponses(socle(), reponses, { canal: 'papier', codePostal: '31670', mois: '2026-11' })

    // THEN
    expect(filtrees).toStrictEqual([reponses[0], reponses[3]])
    expect(filtrerLesReponses(socle(), reponses, {})).toStrictEqual(reponses)
  })

  it('regroupe les textes libres identiques par question et par champ, les plus fréquents d’abord', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q9: { pourquoi: ' Trop  rapide ', valeur: 'plutot-non' } }),
      uneReponse({ q9: { pourquoi: 'Pas assez de temps', valeur: 'non-pas-du-tout' } }),
      uneReponse({ q9: { pourquoi: 'Trop rapide', valeur: 'non-pas-du-tout' } }),
      uneReponse({ q9: { pourquoi: '   ', valeur: 'plutot-non' } }),
      uneReponse({
        q5: { autre: 'Montre connectée', valeur: ['autre'] },
        q7: { lequelTexte: 'Une liseuse', valeur: 'oui' },
      }),
    ]

    // WHEN
    const { textesLibres } = calculerLesResultats(socle(), reponses)

    // THEN
    expect(textesLibres.map(({ champ, nombre, numero, texte }) => ({ champ, nombre, numero, texte }))).toStrictEqual([
      { champ: 'autre', nombre: 1, numero: 5, texte: 'Montre connectée' },
      { champ: 'lequelTexte', nombre: 1, numero: 7, texte: 'Une liseuse' },
      { champ: 'pourquoi', nombre: 2, numero: 9, texte: 'Trop rapide' },
      { champ: 'pourquoi', nombre: 1, numero: 9, texte: 'Pas assez de temps' },
    ])
    expect(textesLibres[2]).toMatchObject({
      partie: 'bilan',
      titre: 'Est-ce que les accompagnements à l’utilisation du numérique ont répondu à vos attentes ?',
    })
  })

  it('propose comme filtres les codes postaux et les mois des réponses', () => {
    // GIVEN
    const reponses = [
      uneReponse({ q26: { valeur: '31670' } }, 'papier', '2026-12-01T09:00:00.000Z'),
      uneReponse({ q26: { valeur: '31320' } }, 'papier', '2026-11-20T10:00:00.000Z'),
      uneReponse({ q26: { valeur: '31670' } }, 'papier', '2026-11-21T10:00:00.000Z'),
      uneReponse({}, 'papier', '2026-11-21T10:00:00.000Z'),
    ]

    // WHEN
    const options = optionsDeFiltre(socle(), reponses)

    // THEN
    expect(options).toStrictEqual({ codesPostaux: ['31320', '31670'], mois: ['2026-11', '2026-12'] })
  })
})

function socle(): Questionnaire {
  const questionnaire = questionnaireDeVersion('socle-v22')
  if (questionnaire === undefined) {
    throw new Error('socle-v22 introuvable')
  }
  return questionnaire
}

function uneReponse(
  contenu: Contenu,
  canal: Canal = 'en-ligne',
  depot = '2026-11-20T10:00:00.000Z'
): ReponseEnregistree {
  return { canal, contenu, depot: new Date(depot), questionnaireVersion: 'socle-v22' }
}

function repartition(
  resultats: ReturnType<typeof calculerLesResultats>,
  code: string
): Extract<ReturnType<typeof calculerLesResultats>['questions'][number], { type: 'repartition' }> {
  const question = resultats.questions.find((candidate) => candidate.type === 'repartition' && candidate.code === code)
  if (question?.type !== 'repartition') {
    throw new Error(`pas de répartition pour ${code}`)
  }
  return question
}
