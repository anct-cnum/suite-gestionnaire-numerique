import {
  Canal,
  ConditionDecrite,
  Contenu,
  NIVEAUX_ECHELLE,
  Option,
  Question,
  QuestionEchelle,
  QuestionGrille,
  Questionnaire,
  Valeur,
} from './Questionnaire'

// Résultats agrégés d'une campagne. Chaque question est rapportée aux personnes qui y ont répondu : une
// question conditionnelle l'est donc à celles à qui elle a été posée, une question laissée vide sur le papier
// ne compte pas. Les codes des questions et des options étant stables d'une version à l'autre, les réponses
// sont comptées par code ; les libellés sont ceux du questionnaire de la campagne.

export function calculerLesResultats(
  questionnaire: Questionnaire,
  reponses: ReadonlyArray<ReponseEnregistree>
): Resultats {
  const contenus = reponses.map((reponse) => reponse.contenu)
  return {
    chiffresCles: {
      nouvellesChoses: partDesReponses(contenus, CHIFFRES_CLES.nouvellesChoses),
      plusALAise: partPlusALAise(contenus),
      progres: partDesReponses(contenus, CHIFFRES_CLES.progres),
    },
    questions: resultatsParQuestion(questionnaire, contenus),
    total: reponses.length,
  }
}

export function filtrerLesReponses(
  questionnaire: Questionnaire,
  reponses: ReadonlyArray<ReponseEnregistree>,
  { canal, codePostal, mois }: Filtres
): ReadonlyArray<ReponseEnregistree> {
  return reponses.filter(
    (reponse) =>
      (canal === undefined || reponse.canal === canal) &&
      (mois === undefined || moisDuDepot(reponse.depot) === mois) &&
      (codePostal === undefined || codePostalDe(questionnaire, reponse.contenu) === codePostal)
  )
}

export function optionsDeFiltre(
  questionnaire: Questionnaire,
  reponses: ReadonlyArray<ReponseEnregistree>
): OptionsDeFiltre {
  const codesPostaux = reponses
    .map((reponse) => codePostalDe(questionnaire, reponse.contenu))
    .filter((codePostal) => codePostal !== undefined)
  return {
    codesPostaux: [...new Set(codesPostaux)].toSorted(parOrdreAlphabetique),
    mois: [...new Set(reponses.map((reponse) => moisDuDepot(reponse.depot)))].toSorted(parOrdreAlphabetique),
  }
}

// Mois du dépôt à l'heure de Paris, au format AAAA-MM
function moisDuDepot(depot: Date): string {
  const parties = FORMAT_MOIS.formatToParts(depot)
  function valeur(type: string): string {
    return parties.find((partie) => partie.type === type)?.value ?? ''
  }
  return `${valeur('year')}-${valeur('month')}`
}

// Questions du socle qui donnent les chiffres clés. Leurs codes sont stables : une nouvelle version les garde.
const POSITIF = ['oui-tout-a-fait', 'plutot-oui']
const CHIFFRES_CLES = {
  avantApres: { apres: 'q11', avant: 'q10' },
  nouvellesChoses: { question: 'q15', reponsesParmi: POSITIF },
  progres: { question: 'q12', reponsesParmi: POSITIF },
} as const

const FORMAT_MOIS = new Intl.DateTimeFormat('fr-FR', { month: '2-digit', timeZone: 'Europe/Paris', year: 'numeric' })

export type ReponseEnregistree = Readonly<{
  canal: Canal
  contenu: Contenu
  depot: Date
  questionnaireVersion: string
}>

export type Filtres = Readonly<{
  canal?: Canal
  codePostal?: string
  // AAAA-MM
  mois?: string
}>

export type OptionsDeFiltre = Readonly<{
  codesPostaux: ReadonlyArray<string>
  mois: ReadonlyArray<string>
}>

export type Part = Readonly<{
  base: number
  nombre: number
}>

export type Resultats = Readonly<{
  chiffresCles: Readonly<{ nouvellesChoses: Part; plusALAise: Part; progres: Part }>
  questions: ReadonlyArray<ResultatQuestion>
  total: number
}>

export type ResultatQuestion = ResultatAvantApres | ResultatGrille | ResultatRepartition

type Compte = Readonly<{
  code: string
  libelle: string
  nombre: number
}>

function resultatsParQuestion(
  questionnaire: Questionnaire,
  contenus: ReadonlyArray<Contenu>
): ReadonlyArray<ResultatQuestion> {
  const { questions } = questionnaire
  const resultats: Array<ResultatQuestion> = []
  questions.forEach((question, index) => {
    const precedente = questions.at(index - 1)
    const suivante = questions.at(index + 1)
    // Deux échelles qui se suivent : avant et après les accompagnements, lues ensemble
    if (question.type === 'echelle' && index > 0 && precedente?.type === 'echelle') {
      return
    }
    if (question.type === 'echelle' && suivante?.type === 'echelle') {
      resultats.push(
        avantApres(question, suivante, contenus, [
          questionnaire.numero(question.code),
          questionnaire.numero(suivante.code),
        ])
      )
      return
    }
    if (question.type === 'grille') {
      resultats.push(grille(question, contenus, questionnaire.numero(question.code)))
      return
    }
    resultats.push(repartition(questionnaire, question, contenus))
  })
  return resultats
}

function repartition(
  questionnaire: Questionnaire,
  question: Exclude<Question, QuestionGrille>,
  contenus: ReadonlyArray<Contenu>
): ResultatRepartition {
  const valeurs = contenus.map((contenu) => valeursDe(contenu, question.code)).filter((codes) => codes.length > 0)
  return {
    base: valeurs.length,
    code: question.code,
    condition: question.condition === undefined ? undefined : questionnaire.decrire(question.condition),
    multiple: question.type === 'choix-multiple',
    numero: questionnaire.numero(question.code),
    options: optionsDe(question, valeurs).map((option) => ({
      code: option.code,
      libelle: option.libelle,
      nombre: valeurs.filter((codes) => codes.includes(option.code)).length,
    })),
    partie: question.partie,
    titre: question.titre,
    type: 'repartition',
  }
}

function avantApres(
  avant: QuestionEchelle,
  apres: QuestionEchelle,
  contenus: ReadonlyArray<Contenu>,
  numeros: readonly [number, number]
): ResultatAvantApres {
  const paires = pairesAvantApres(contenus, avant.code, apres.code)
  return {
    base: paires.length,
    codes: [avant.code, apres.code],
    niveaux: NIVEAUX_ECHELLE.map((niveau) => ({
      apres: paires.filter((paire) => paire.apres === niveau).length,
      avant: paires.filter((paire) => paire.avant === niveau).length,
      niveau,
    })),
    numeros,
    partie: avant.partie,
    poles: avant.poles,
    titres: [avant.titre, apres.titre],
    type: 'avant-apres',
  }
}

function grille(question: QuestionGrille, contenus: ReadonlyArray<Contenu>, numero: number): ResultatGrille {
  const reponses = contenus.map((contenu) => contenu[question.code]?.valeur)
  return {
    code: question.code,
    lignes: question.lignes.options.map((ligne) => {
      const choix = reponses
        .map((valeur) => (estUneGrille(valeur) ? valeur[ligne.code] : undefined))
        .filter((code) => code !== undefined)
      return {
        base: choix.length,
        code: ligne.code,
        libelle: ligne.libelle,
        options: question.options.map((option) => ({
          code: option.code,
          libelle: option.libelle,
          nombre: choix.filter((code) => code === option.code).length,
        })),
      }
    }),
    numero,
    partie: question.partie,
    titre: question.titre,
    type: 'grille',
  }
}

// Options rapportées : celles du questionnaire ; pour une échelle, ses niveaux ; pour un code postal, les
// valeurs données
function optionsDe(
  question: Exclude<Question, QuestionGrille>,
  valeurs: ReadonlyArray<ReadonlyArray<string>>
): ReadonlyArray<Option> {
  switch (question.type) {
    case 'choix-multiple':
    case 'choix-unique':
      return question.options
    case 'code-postal':
      return [...new Set(valeurs.flat())].toSorted(parOrdreAlphabetique).map((code) => ({ code, libelle: code }))
    case 'echelle':
      return NIVEAUX_ECHELLE.map((niveau) => ({ code: niveau, libelle: niveau }))
  }
}

function partDesReponses(
  contenus: ReadonlyArray<Contenu>,
  { question, reponsesParmi }: Readonly<{ question: string; reponsesParmi: ReadonlyArray<string> }>
): Part {
  const valeurs = contenus.map((contenu) => valeursDe(contenu, question)).filter((codes) => codes.length > 0)
  return {
    base: valeurs.length,
    nombre: valeurs.filter((codes) => codes.some((code) => reponsesParmi.includes(code))).length,
  }
}

function partPlusALAise(contenus: ReadonlyArray<Contenu>): Part {
  const paires = pairesAvantApres(contenus, CHIFFRES_CLES.avantApres.avant, CHIFFRES_CLES.avantApres.apres)
  return { base: paires.length, nombre: paires.filter((paire) => Number(paire.apres) > Number(paire.avant)).length }
}

function pairesAvantApres(
  contenus: ReadonlyArray<Contenu>,
  codeAvant: string,
  codeApres: string
): ReadonlyArray<Readonly<{ apres: string; avant: string }>> {
  return contenus.flatMap((contenu) => {
    const avant = valeursDe(contenu, codeAvant).at(0)
    const apres = valeursDe(contenu, codeApres).at(0)
    return avant === undefined || apres === undefined ? [] : [{ apres, avant }]
  })
}

// Codes donnés en réponse à une question à choix, à une échelle ou à un code postal
function valeursDe(contenu: Contenu, code: string): ReadonlyArray<string> {
  const valeur = contenu[code]?.valeur
  if (typeof valeur === 'string') {
    return valeur === '' ? [] : [valeur]
  }
  return estUneListe(valeur) ? valeur : []
}

function estUneListe(valeur: undefined | Valeur): valeur is ReadonlyArray<string> {
  return Array.isArray(valeur)
}

function parOrdreAlphabetique(un: string, autre: string): number {
  return un.localeCompare(autre)
}

function estUneGrille(valeur: undefined | Valeur): valeur is Readonly<Record<string, string>> {
  return typeof valeur === 'object' && !Array.isArray(valeur)
}

function codePostalDe(questionnaire: Questionnaire, contenu: Contenu): string | undefined {
  const question = questionnaire.questions.find((candidate) => candidate.type === 'code-postal')
  const valeur = question === undefined ? undefined : contenu[question.code]?.valeur
  return typeof valeur === 'string' ? valeur : undefined
}

type ResultatRepartition = Readonly<{
  base: number
  code: string
  condition: ConditionDecrite | undefined
  multiple: boolean
  numero: number
  options: ReadonlyArray<Compte>
  partie: Question['partie']
  titre: string
  type: 'repartition'
}>

type ResultatAvantApres = Readonly<{
  base: number
  codes: readonly [string, string]
  niveaux: ReadonlyArray<Readonly<{ apres: number; avant: number; niveau: string }>>
  numeros: readonly [number, number]
  partie: Question['partie']
  poles: QuestionEchelle['poles']
  titres: readonly [string, string]
  type: 'avant-apres'
}>

type ResultatGrille = Readonly<{
  code: string
  lignes: ReadonlyArray<Readonly<{ base: number; code: string; libelle: string; options: ReadonlyArray<Compte> }>>
  numero: number
  partie: Question['partie']
  titre: string
  type: 'grille'
}>
