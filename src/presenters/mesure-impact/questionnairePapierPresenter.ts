import { QuestionnairePapierReadModel } from '@/use-cases/mesure-impact/RecupererLeQuestionnairePapier'

// Questionnaire à imprimer : chaque question avec son numéro, sa consigne et ses cases, rédigées pour le papier
export function questionnairePapierPresenter(readModel: QuestionnairePapierReadModel): QuestionnairePapierViewModel {
  const { identifiantPublic, libelleTerritoire, questionnaire } = readModel
  return {
    consignes: CONSIGNES,
    fin: 'Merci pour vos réponses ! Remettez ce questionnaire à votre médiateur ou à votre médiatrice numérique.',
    introduction:
      'Vous avez été accompagné(e) pour utiliser le numérique par un médiateur ou une médiatrice numérique. Ce ' +
      'questionnaire permet de comprendre ce que cet accompagnement a changé pour vous.',
    nomDuFichier: `questionnaire-papier-${identifiantPublic}.pdf`,
    parties: questionnaire.parties.map(({ intro, questions, titre }) => ({
      intro,
      questions: questions.map(questionPresentee),
      titre,
    })),
    territoire: libelleTerritoire,
    titre: 'Votre avis sur vos accompagnements au numérique',
  }
}

export type QuestionnairePapierViewModel = Readonly<{
  consignes: ReadonlyArray<string>
  fin: string
  introduction: string
  nomDuFichier: string
  parties: ReadonlyArray<Readonly<{ intro: string; questions: ReadonlyArray<QuestionPapierViewModel>; titre: string }>>
  territoire: string
  titre: string
}>

export type QuestionPapierViewModel = Readonly<{
  aide?: string
  // À qui s'adresse la question, quand elle ne concerne pas tout le monde
  consigne?: string
  reponse: ReponsePapier
  titre: string
}>

type ReponsePapier =
  | Readonly<{
      cases: ReadonlyArray<Readonly<{ libelle: string; precisez: boolean }>>
      forme: 'carre' | 'rond'
      lequel?: Readonly<{ cases: ReadonlyArray<string>; titre: string }>
      pourquoi?: string
      type: 'cases'
    }>
  | Readonly<{ colonnes: ReadonlyArray<string>; lignes: ReadonlyArray<string>; type: 'grille' }>
  | Readonly<{ niveaux: ReadonlyArray<string>; type: 'echelle' }>
  | Readonly<{ type: 'code-postal' }>

type QuestionPapier = QuestionnairePapierReadModel['questionnaire']['parties'][number]['questions'][number]

const CONSIGNES: ReadonlyArray<string> = [
  'Le questionnaire dure environ 15 minutes.',
  'Il est anonyme : n’écrivez ni votre nom, ni votre adresse.',
  'Il n’existe pas de mauvaise réponse. Répondez le plus sincèrement possible.',
  'Cochez les cases qui correspondent à votre situation.',
]

function questionPresentee(question: QuestionPapier): QuestionPapierViewModel {
  const titre = `${question.numero}. ${question.titre}`
  const consigne =
    question.condition === undefined
      ? {}
      : {
          consigne: `Répondez seulement si vous avez répondu ${enGuillemets(question.condition.reponses)} à la question ${question.condition.numero}.`,
        }
  switch (question.type) {
    case 'choix':
      return {
        aide: question.aide ?? (question.multiple ? 'Cochez une ou plusieurs réponses.' : 'Cochez une seule réponse.'),
        ...consigne,
        reponse: {
          cases: question.options.map(({ exclusive, libelle, precisez }) => ({
            libelle: libelleDeLaCase(libelle, exclusive, precisez),
            precisez,
          })),
          forme: question.multiple ? 'carre' : 'rond',
          ...(question.lequel === undefined
            ? {}
            : {
                lequel: {
                  cases: question.lequel.options,
                  titre: `Si « ${question.lequel.siReponse} », lequel ou lesquels ?`,
                },
              }),
          ...(question.pourquoi === undefined
            ? {}
            : { pourquoi: `Si vous avez répondu ${enGuillemets(question.pourquoi)}, pourquoi ?` }),
          type: 'cases',
        },
        titre,
      }
    case 'code-postal':
      return { ...aide(question.aide), ...consigne, reponse: { type: 'code-postal' }, titre }
    case 'echelle':
      return {
        aide: `Cochez un seul chiffre, de 1 (${question.poles.minimum}) à 5 (${question.poles.maximum}).`,
        ...consigne,
        reponse: { niveaux: question.niveaux, type: 'echelle' },
        titre,
      }
    case 'grille':
      return {
        aide: question.aide ?? 'Cochez une case par ligne.',
        consigne: `Répondez seulement pour les réponses que vous avez cochées à la question ${question.selon}.`,
        reponse: { colonnes: question.colonnes, lignes: question.lignes, type: 'grille' },
        titre,
      }
  }
}

function aide(texte: string | undefined): Readonly<{ aide?: string }> {
  return texte === undefined ? {} : { aide: texte }
}

function enGuillemets(reponses: ReadonlyArray<string>): string {
  return reponses.map((reponse) => `« ${reponse} »`).join(' ou ')
}

function libelleDeLaCase(libelle: string, exclusive: boolean, precisez: boolean): string {
  if (precisez) {
    return `${libelle}, précisez :`
  }
  return exclusive ? `${libelle} (ne cochez alors aucune autre case)` : libelle
}
