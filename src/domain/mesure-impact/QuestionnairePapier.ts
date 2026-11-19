import {
  ConditionDecrite,
  NIVEAUX_ECHELLE,
  Option,
  Question,
  QuestionChoixMultiple,
  QuestionChoixUnique,
  QuestionEchelle,
  Questionnaire,
} from './Questionnaire'

// Version papier du questionnaire, tirée de sa définition versionnée : elle suit chaque version sans être
// réécrite. Comme à la saisie papier, toutes les questions, options et lignes sont proposées ; une condition
// devient une consigne écrite (« Répondez si… »), puisque personne ne trie les questions à la place du papier.
// La numérotation est celle de la saisie et des résultats.
export function versionPapier(questionnaire: Questionnaire): QuestionnairePapier {
  return {
    parties: questionnaire.parties.map(({ code, intro, titre }) => ({
      intro,
      questions: questionnaire.questions
        .filter((question) => question.partie === code)
        .map((question) => questionPapier(questionnaire, question)),
      titre,
    })),
  }
}

export type QuestionnairePapier = Readonly<{
  parties: ReadonlyArray<PartiePapier>
}>

export type PartiePapier = Readonly<{
  intro: string
  questions: ReadonlyArray<QuestionPapier>
  titre: string
}>

export type QuestionPapier = (
  | ChoixPapier
  | Readonly<{
      colonnes: ReadonlyArray<string>
      // Quelles lignes remplir, dit en clair ; sinon, le renvoi à la question `selon`
      consigne?: string
      lignes: ReadonlyArray<string>
      // Numéro de la question dont les réponses désignent les lignes à remplir
      selon: number
      type: 'grille'
    }>
  | Readonly<{ niveaux: ReadonlyArray<string>; poles: QuestionEchelle['poles']; type: 'echelle' }>
  | Readonly<{ type: 'code-postal' }>
) &
  QuestionPapierCommune

type OptionPapier = Readonly<{
  // Cochée, elle exclut les autres (« Aucun », « Rien n’a changé »)
  exclusive: boolean
  libelle: string
  // Suivie d'une ligne pour préciser (« Autre »)
  precisez: boolean
}>

type ChoixPapier = Readonly<{
  lequel?: Readonly<{ options: ReadonlyArray<string>; siReponse: string }>
  multiple: boolean
  options: ReadonlyArray<OptionPapier>
  // Réponses après lesquelles la personne peut dire pourquoi
  pourquoi?: ReadonlyArray<string>
  type: 'choix'
}>

type QuestionPapierCommune = Readonly<{
  aide?: string
  condition?: ConditionDecrite
  numero: number
  titre: string
}>

function questionPapier(questionnaire: Questionnaire, question: Question): QuestionPapier {
  const commune = {
    ...(question.aide === undefined ? {} : { aide: question.aide }),
    ...(question.condition === undefined ? {} : { condition: questionnaire.decrire(question.condition) }),
    numero: questionnaire.numero(question.code),
    titre: question.titre,
  }
  switch (question.type) {
    case 'choix-multiple':
    case 'choix-unique':
      return { ...commune, ...choix(question) }
    case 'code-postal':
      return { ...commune, type: 'code-postal' }
    case 'echelle':
      return { ...commune, niveaux: NIVEAUX_ECHELLE, poles: question.poles, type: 'echelle' }
    case 'grille':
      return {
        ...commune,
        colonnes: libelles(question.options),
        ...(question.lignes.consignePapier === undefined ? {} : { consigne: question.lignes.consignePapier }),
        lignes: libelles(question.lignes.options),
        selon: questionnaire.numero(question.lignes.parmiLesReponsesA),
        type: 'grille',
      }
  }
}

function choix(question: QuestionChoixMultiple | QuestionChoixUnique): ChoixPapier {
  const exclusive = question.type === 'choix-multiple' ? question.optionExclusive : undefined
  const options = question.options.map((option) => ({
    exclusive: option.code === exclusive,
    libelle: option.libelle,
    precisez: option.code === question.optionAutre,
  }))
  if (question.type === 'choix-multiple') {
    return { multiple: true, options, type: 'choix' }
  }
  const { lequel, optionsPourquoi } = question
  return {
    ...(lequel === undefined
      ? {}
      : { lequel: { options: libelles(lequel.options), siReponse: libelleDe(question.options, lequel.siOption) } }),
    multiple: false,
    options,
    ...(optionsPourquoi === undefined
      ? {}
      : {
          pourquoi: question.options
            .filter((option) => optionsPourquoi.includes(option.code))
            .map(({ libelle }) => libelle),
        }),
    type: 'choix',
  }
}

function libelleDe(options: ReadonlyArray<Option>, code: string): string {
  return options.find((option) => option.code === code)?.libelle ?? code
}

function libelles(options: ReadonlyArray<Option>): ReadonlyArray<string> {
  return options.map(({ libelle }) => libelle)
}
