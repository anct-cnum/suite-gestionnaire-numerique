import { describe, expect, it } from 'vitest'

import { Canal, Contenu, Question, QuestionGrille, Questionnaire } from './Questionnaire'
import { questionnaireDeVersion } from './questionnaires'

describe('questionnaire de la mesure d’impact (socle v22)', () => {
  const questionnaire = questionnaireDeVersion('socle-v22') as Questionnaire

  it('est retrouvé par sa version, une version inconnue ne donne rien', () => {
    // THEN
    expect(questionnaire.version).toBe('socle-v22')
    expect(questionnaire.questions).toHaveLength(26)
    expect(questionnaire.parties.map((partie) => partie.code)).toStrictEqual(['contexte', 'bilan', 'vous'])
    expect(questionnaireDeVersion('inconnue')).toBeUndefined()
  })

  it('chaque règle ne dépend que de questions placées avant elle, dont dépend le nettoyage dans l’ordre', () => {
    // GIVEN
    const ordre = questionnaire.questions.map((candidate) => candidate.code)

    // WHEN
    const dependancesMalPlacees = questionnaire.questions.flatMap((candidate, position) =>
      questionsQuiCommandent(candidate)
        .filter((commande) => !ordre.slice(0, position).includes(commande))
        .map((commande) => `${candidate.code} dépend de ${commande}`)
    )

    // THEN
    expect(dependancesMalPlacees).toStrictEqual([])
  })

  describe('questions posées', () => {
    it('en ligne, la Q13 est posée tant que la Q12 n’a pas de réponse, puis seulement si la Q12 est positive', () => {
      // THEN
      expect(posees({}, 'en-ligne')).toContain('q13')
      expect(posees({ q12: { valeur: 'plutot-oui' } }, 'en-ligne')).toContain('q13')
      expect(posees({ q12: { valeur: 'plutot-non' } }, 'en-ligne')).not.toContain('q13')
    })

    it('en ligne, la Q16 n’est posée que si la Q15 est positive', () => {
      // THEN
      expect(posees({ q15: { valeur: 'oui-tout-a-fait' } }, 'en-ligne')).toContain('q16')
      expect(posees({ q15: { valeur: 'non-pas-du-tout' } }, 'en-ligne')).not.toContain('q16')
    })

    it('en ligne, la Q14 n’est posée que si un équipement de la liste est coché à la Q6', () => {
      // THEN
      expect(posees({}, 'en-ligne')).not.toContain('q14')
      expect(posees({ q6: { valeur: ['autre'] } }, 'en-ligne')).not.toContain('q14')
      expect(posees({ q6: { valeur: ['tablette'] } }, 'en-ligne')).toContain('q14')
    })

    it('par téléphone, les conditions restent actives', () => {
      // THEN
      expect(posees({ q12: { valeur: 'pas-du-tout' } }, 'telephone')).not.toContain('q13')
    })

    it('sur papier, toutes les questions sont posées', () => {
      // THEN
      expect(posees({ q12: { valeur: 'pas-du-tout' } }, 'papier')).toHaveLength(26)
    })
  })

  describe('options proposées', () => {
    it.each([
      { attendues: [], intention: 'sans équipement à la Q6, ni logiciels ni applications', q6: [] },
      { attendues: ['logiciels-ordinateur'], intention: 'avec un ordinateur, les logiciels', q6: ['ordinateur-fixe'] },
      {
        attendues: ['applications-telephone'],
        intention: 'avec un téléphone portable, les applications',
        q6: ['telephone-portable'],
      },
      {
        attendues: ['logiciels-ordinateur', 'applications-telephone'],
        intention: 'avec les deux, les deux',
        q6: ['ordinateur-portable', 'telephone-portable'],
      },
    ])('en ligne, Q8 : $intention', ({ attendues, q6 }) => {
      // WHEN
      const codes = codesOptions('q8', { q6: { valeur: q6 } }, 'en-ligne')

      // THEN
      expect(codes.filter((code) => ['applications-telephone', 'logiciels-ordinateur'].includes(code))).toStrictEqual(
        attendues
      )
      expect(codes).toHaveLength(12 + attendues.length)
    })

    it('sur papier, la Q8 propose toutes ses options', () => {
      // THEN
      expect(codesOptions('q8', {}, 'papier')).toHaveLength(14)
    })

    it('la Q14 propose les équipements cochés à la Q6, dans l’ordre du document ; sur papier, tous', () => {
      // GIVEN
      const q14 = question('q14') as QuestionGrille
      const contenu = { q6: { valeur: ['ordinateur-fixe', 'tablette', 'autre'] } }

      // THEN
      expect(questionnaire.lignesProposees(q14, contenu, 'en-ligne').map((ligne) => ligne.code)).toStrictEqual([
        'tablette',
        'ordinateur-fixe',
      ])
      expect(questionnaire.lignesProposees(q14, contenu, 'papier')).toHaveLength(7)
    })

    it('« Lequel/lesquels ? » de la Q7 propose les équipements cochés à la Q5 ; sur papier, tous', () => {
      // GIVEN
      const contenu = { q5: { valeur: ['telephone-portable', 'autre'] } }

      // THEN
      expect(
        questionnaire.optionsLequel(question('q7'), contenu, 'en-ligne').map((option) => option.code)
      ).toStrictEqual(['telephone-portable'])
      expect(questionnaire.optionsLequel(question('q7'), { q5: { valeur: ['aucun'] } }, 'en-ligne')).toStrictEqual([])
      expect(questionnaire.optionsLequel(question('q7'), contenu, 'papier')).toHaveLength(7)
      expect(questionnaire.optionsLequel(question('q3'), contenu, 'papier')).toStrictEqual([])
    })
  })

  describe('nettoyage après un retour en arrière', () => {
    it('efface la réponse d’une question qui n’est plus posée', () => {
      // GIVEN
      const contenu = { q12: { valeur: 'plutot-non' }, q13: { valeur: ['travailler'] } }

      // WHEN
      const nettoye = questionnaire.nettoyer(contenu, 'en-ligne')

      // THEN
      expect(nettoye).toStrictEqual({ q12: { valeur: 'plutot-non' } })
    })

    it('retire les options, les lignes et les équipements qui ne sont plus proposés', () => {
      // GIVEN
      const contenu: Contenu = {
        q14: { valeur: { 'ordinateur-fixe': 'plutot-oui', 'telephone-portable': 'plutot-non' } },
        q5: { valeur: ['tablette'] },
        q6: { valeur: ['ordinateur-fixe'] },
        q7: { lequel: ['tablette', 'telephone-portable'], valeur: 'oui' },
        q8: { valeur: ['applications-telephone', 'logiciels-ordinateur'] },
      }

      // WHEN
      const nettoye = questionnaire.nettoyer(contenu, 'en-ligne')

      // THEN
      expect(nettoye).toStrictEqual({
        q14: { valeur: { 'ordinateur-fixe': 'plutot-oui' } },
        q5: { valeur: ['tablette'] },
        q6: { valeur: ['ordinateur-fixe'] },
        q7: { lequel: ['tablette'], valeur: 'oui' },
        q8: { valeur: ['logiciels-ordinateur'] },
      })
    })

    it('retire les précisions qui ne sont plus appelées par la réponse', () => {
      // GIVEN
      const contenu: Contenu = {
        q1: { autre: 'Jouer en ligne', valeur: ['travailler'] },
        q7: { lequelTexte: 'Montre', valeur: 'non' },
        q9: { pourquoi: 'Trop court', valeur: 'plutot-oui' },
      }

      // WHEN
      const nettoye = questionnaire.nettoyer(contenu, 'en-ligne')

      // THEN
      expect(nettoye).toStrictEqual({
        q1: { valeur: ['travailler'] },
        q7: { valeur: 'non' },
        q9: { valeur: 'plutot-oui' },
      })
    })

    it('ne garde ni réponse vide, ni question inconnue', () => {
      // GIVEN
      const contenu: Contenu = { inconnue: { valeur: 'x' }, q1: { valeur: [] }, q26: { valeur: '' } }

      // WHEN
      const nettoye = questionnaire.nettoyer(contenu, 'telephone')

      // THEN
      expect(nettoye).toStrictEqual({})
    })

    it('sur papier, garde tout ce qui a été coché', () => {
      // GIVEN
      const contenu: Contenu = { q12: { valeur: 'pas-du-tout' }, q13: { valeur: ['travailler'] } }

      // WHEN
      const nettoye = questionnaire.nettoyer(contenu, 'papier')

      // THEN
      expect(nettoye).toStrictEqual(contenu)
    })
  })

  describe('vérification d’un questionnaire envoyé', () => {
    it('en ligne, un questionnaire complet et cohérent est accepté', () => {
      // THEN
      expect(questionnaire.verifier(contenuComplet(), 'en-ligne')).toStrictEqual([])
    })

    it('en ligne, chaque question posée demande une réponse, sauf les précisions', () => {
      // GIVEN
      const contenu = Object.fromEntries(
        Object.entries(contenuComplet()).filter(([code]) => code !== 'q3' && code !== 'q14')
      )

      // WHEN
      const erreurs = questionnaire.verifier(contenu, 'en-ligne')

      // THEN
      expect(erreurs).toStrictEqual([
        { motif: 'reponseManquante', question: 'q3' },
        { motif: 'reponseManquante', question: 'q14' },
      ])
    })

    it('en ligne, une grille à moitié remplie est incomplète', () => {
      // GIVEN
      const contenu = { ...contenuComplet(), q14: { valeur: { 'ordinateur-portable': 'plutot-oui' } } }

      // WHEN
      const erreurs = questionnaire.verifier(contenu, 'en-ligne')

      // THEN
      expect(erreurs).toStrictEqual([{ motif: 'reponseManquante', question: 'q14' }])
    })

    it.each([
      { canal: 'telephone' as const, intention: 'par téléphone' },
      { canal: 'papier' as const, intention: 'sur papier' },
    ])('$intention, un questionnaire vide est accepté', ({ canal }) => {
      // THEN
      expect(questionnaire.verifier({}, canal)).toStrictEqual([])
    })

    it.each([
      { contenu: { inconnue: { valeur: 'oui' } }, intention: 'question inconnue', motif: 'questionInconnue' },
      {
        contenu: { q12: { valeur: 'pas-du-tout' }, q13: { valeur: ['travailler'] } },
        intention: 'réponse à une question qui n’est pas posée',
        motif: 'questionNonPosee',
        question: 'q13',
      },
      { contenu: { q3: { valeur: 'jamais' } }, intention: 'option inconnue', motif: 'reponseInvalide' },
      {
        contenu: { q3: { valeur: ['1-a-4'] } },
        intention: 'plusieurs réponses à un choix unique',
        motif: 'reponseInvalide',
      },
      { contenu: { q1: { valeur: 'travailler' } }, intention: 'choix multiple non tableau', motif: 'reponseInvalide' },
      {
        contenu: { q1: { valeur: ['travailler', 'travailler'] } },
        intention: 'option en double',
        motif: 'reponseInvalide',
      },
      {
        contenu: { q5: { valeur: ['aucun', 'tablette'] } },
        intention: '« Aucun » avec un équipement',
        motif: 'reponseInvalide',
      },
      {
        contenu: { q6: { valeur: ['tablette'] }, q8: { valeur: ['logiciels-ordinateur'] } },
        intention: 'option non proposée',
        motif: 'reponseInvalide',
        question: 'q8',
      },
      { contenu: { q10: { valeur: '6' } }, intention: 'échelle hors de 1 à 5', motif: 'reponseInvalide' },
      {
        contenu: { q14: { valeur: { tablette: 'peut-etre' } }, q6: { valeur: ['tablette'] } },
        intention: 'grille avec une option inconnue',
        motif: 'reponseInvalide',
        question: 'q14',
      },
      {
        contenu: { q14: { valeur: { 'imprimante-3d': 'plutot-oui' } }, q6: { valeur: ['tablette'] } },
        intention: 'grille avec une ligne non proposée',
        motif: 'reponseInvalide',
        question: 'q14',
      },
      {
        contenu: { q14: { valeur: ['plutot-oui'] }, q6: { valeur: ['tablette'] } },
        intention: 'grille non objet',
        motif: 'reponseInvalide',
        question: 'q14',
      },
      { contenu: { q26: { valeur: '3167' } }, intention: 'code postal à 4 chiffres', motif: 'reponseInvalide' },
      { contenu: { q26: { valeur: ['31670'] } }, intention: 'code postal non texte', motif: 'reponseInvalide' },
      {
        contenu: { q1: { autre: 'Jouer', valeur: ['travailler'] } },
        intention: 'précision sans « Autre »',
        motif: 'reponseInvalide',
      },
      {
        contenu: { q9: { pourquoi: 'Bien', valeur: 'plutot-oui' } },
        intention: '« Pourquoi ? » sans réponse négative',
        motif: 'reponseInvalide',
      },
      {
        contenu: { q5: { valeur: ['tablette'] }, q7: { lequel: ['ordinateur-fixe'], valeur: 'oui' } },
        intention: 'équipement non coché à la Q5',
        motif: 'reponseInvalide',
        question: 'q7',
      },
      {
        contenu: { q7: { lequelTexte: 'Montre', valeur: 'non' } },
        intention: '« Lequel ? » sans « Oui »',
        motif: 'reponseInvalide',
      },
      {
        contenu: { q3: { lequelTexte: 'Montre', valeur: '1-a-4' } },
        intention: '« Lequel ? » sur une question qui n’en a pas',
        motif: 'reponseInvalide',
      },
      {
        contenu: { q1: { autre: 'x'.repeat(201), valeur: ['autre'] } },
        intention: 'précision « Autre » de plus de 200 caractères',
        motif: 'texteTropLong',
      },
      {
        contenu: { q9: { pourquoi: 'x'.repeat(1001), valeur: 'plutot-non' } },
        intention: '« Pourquoi ? » de plus de 1000 caractères',
        motif: 'texteTropLong',
      },
    ])('refuse : $intention', ({ contenu, motif, question }) => {
      // WHEN
      const erreurs = questionnaire.verifier(contenu as Contenu, 'telephone')

      // THEN
      expect(erreurs).toStrictEqual([{ motif, question: question ?? Object.keys(contenu)[0] }])
    })

    it('accepte les précisions quand la réponse les appelle', () => {
      // GIVEN
      const contenu: Contenu = {
        q1: { autre: 'Jouer en ligne', valeur: ['autre'] },
        q17: { autre: 'Le centre social', valeur: 'autre' },
        q5: { valeur: ['aucun'] },
        q7: { lequelTexte: 'Une liseuse', valeur: 'oui' },
        q9: { pourquoi: 'Trop court', valeur: 'non-pas-du-tout' },
      }

      // THEN
      expect(questionnaire.verifier(contenu, 'telephone')).toStrictEqual([])
    })
  })

  describe('réponse à une question', () => {
    it.each([
      { contenu: {}, intention: 'sans réponse', repondue: false },
      { contenu: { q26: { valeur: '31670' } }, intention: 'code postal valide', repondue: true },
      { contenu: { q26: { valeur: '316' } }, intention: 'code postal incomplet', repondue: false },
    ])('code postal : $intention', ({ contenu, repondue }) => {
      // THEN
      expect(questionnaire.estRepondue(question('q26'), contenu, 'en-ligne')).toBe(repondue)
    })
  })

  function question(code: string): Questionnaire['questions'][number] {
    return questionnaire.questions.find((candidate) => candidate.code === code) as Questionnaire['questions'][number]
  }

  function posees(contenu: Contenu, canal: Canal): ReadonlyArray<string> {
    return questionnaire.questionsPosees(contenu, canal).map((posee) => posee.code)
  }

  function codesOptions(code: string, contenu: Contenu, canal: Canal): ReadonlyArray<string> {
    return questionnaire.optionsProposees(question(code), contenu, canal).map((option) => option.code)
  }
})

// Questions dont la réponse commande une question : sa condition, celles de ses options, les lignes d'une
// grille, les équipements du « Lequel ? »
function questionsQuiCommandent(question: Question): ReadonlyArray<string> {
  const options = 'options' in question ? question.options : []
  const commandes = [
    question.condition?.question,
    ...options.map((option) => option.condition?.question),
    question.type === 'grille' ? question.lignes.parmiLesReponsesA : undefined,
    question.type === 'choix-unique' ? question.lequel?.parmiLesReponsesA : undefined,
  ]
  return commandes.filter((code) => code !== undefined)
}

function contenuComplet(): Contenu {
  return {
    q1: { valeur: ['echanger-proches', 'demarches-administratives'] },
    q10: { valeur: '2' },
    q11: { valeur: '4' },
    q12: { valeur: 'oui-tout-a-fait' },
    q13: { valeur: ['demarches-administratives'] },
    q14: { valeur: { 'ordinateur-portable': 'plutot-oui', 'telephone-portable': 'plutot-non' } },
    q15: { pourquoi: 'Je n’ai pas encore essayé seul(e).', valeur: 'plutot-non' },
    q17: { valeur: 'mairie' },
    q18: { valeur: ['autonome'] },
    q19: { valeur: 'oui' },
    q2: { valeur: ['debloquer-situation'] },
    q20: { valeur: 'femme' },
    q21: { valeur: '60-69' },
    q22: { valeur: 'seul' },
    q23: { valeur: 'retraite' },
    q24: { valeur: 'brevet' },
    q25: { valeur: 'sans-activite' },
    q26: { valeur: '31320' },
    q3: { valeur: '1-a-4' },
    q4: { valeur: ['individuel'] },
    q5: { valeur: ['telephone-portable'] },
    q6: { valeur: ['ordinateur-portable', 'telephone-portable'] },
    q7: { lequel: ['telephone-portable'], valeur: 'oui' },
    q8: { valeur: ['logiciels-ordinateur', 'applications-telephone'] },
    q9: { valeur: 'plutot-oui' },
  }
}
