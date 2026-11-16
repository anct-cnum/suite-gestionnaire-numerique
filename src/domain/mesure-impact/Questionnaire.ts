// Questionnaire de la mesure d'impact : définition versionnée et règles du parcours.
// Les mêmes règles servent à l'écran (questions posées, options proposées, nettoyage après un
// retour en arrière) et au serveur (vérification du questionnaire envoyé).
//
// Canal : en ligne, la personne répond à toutes les questions posées ; par téléphone, les
// conditions restent actives mais aucune réponse n'est obligatoire ; sur papier, toutes les
// questions, options et lignes sont proposées, comme sur la feuille, et rien n'est obligatoire.

export class Questionnaire {
  get parties(): ReadonlyArray<Partie> {
    return this.#definition.parties
  }

  get questions(): ReadonlyArray<Question> {
    return this.#definition.questions
  }

  get version(): string {
    return this.#definition.version
  }

  readonly #definition: DefinitionQuestionnaire

  private constructor(definition: DefinitionQuestionnaire) {
    this.#definition = definition
    Object.freeze(this)
  }

  static create(definition: DefinitionQuestionnaire): Questionnaire {
    return new Questionnaire(definition)
  }

  estRepondue(question: Question, contenu: Contenu, canal: Canal): boolean {
    const valeur = contenu[question.code]?.valeur
    switch (question.type) {
      case 'choix-multiple':
        return estListe(valeur) && valeur.length > 0
      case 'choix-unique':
      case 'echelle':
        return typeof valeur === 'string' && valeur !== ''
      case 'code-postal':
        return typeof valeur === 'string' && CODE_POSTAL.test(valeur)
      case 'grille': {
        const lignes = this.lignesProposees(question, contenu, canal)
        return estObjet(valeur) && lignes.length > 0 && lignes.every((ligne) => ligne.code in valeur)
      }
    }
  }

  lignesProposees(question: QuestionGrille, contenu: Contenu, canal: Canal): ReadonlyArray<Option> {
    const { options, parmiLesReponsesA } = question.lignes
    return canal === 'papier'
      ? options
      : options.filter((ligne) => reponsesA(contenu, parmiLesReponsesA).includes(ligne.code))
  }

  // Remet le contenu en cohérence après une modification : réponses aux questions qui ne sont plus
  // posées, options, lignes et équipements qui ne sont plus proposés, précisions qui ne sont plus
  // appelées. Les questions sont parcourues dans l'ordre : une réponse ne dépend que des précédentes.
  nettoyer(contenu: Contenu, canal: Canal): Contenu {
    return this.questions.reduce<Contenu>((nettoye, question) => {
      const reponse = contenu[question.code]
      if (reponse === undefined || !this.#estPosee(question, nettoye, canal)) {
        return nettoye
      }
      const reponseNettoyee = this.#nettoyerReponse(question, reponse, nettoye, canal)
      return reponseNettoyee === undefined ? nettoye : { ...nettoye, [question.code]: reponseNettoyee }
    }, {})
  }

  optionsLequel(question: Question, contenu: Contenu, canal: Canal): ReadonlyArray<Option> {
    if (question.type !== 'choix-unique' || question.lequel === undefined) {
      return []
    }
    const { options, parmiLesReponsesA } = question.lequel
    return canal === 'papier'
      ? options
      : options.filter((option) => reponsesA(contenu, parmiLesReponsesA).includes(option.code))
  }

  optionsProposees(question: Question, contenu: Contenu, canal: Canal): ReadonlyArray<Option> {
    if (question.type !== 'choix-unique' && question.type !== 'choix-multiple' && question.type !== 'grille') {
      return []
    }
    if (canal === 'papier') {
      return question.options
    }
    return question.options.filter((option) => option.condition === undefined || estRemplie(option.condition, contenu))
  }

  questionsPosees(contenu: Contenu, canal: Canal): ReadonlyArray<Question> {
    return this.questions.filter((question) => this.#estPosee(question, contenu, canal))
  }

  // Vérifie un questionnaire envoyé tel quel, sans le corriger : l'écran envoie un contenu déjà
  // nettoyé, toute incohérence signale donc un envoi qui ne vient pas du parcours.
  verifier(contenu: Contenu, canal: Canal): ReadonlyArray<ErreurDeContenu> {
    const inconnues = Object.keys(contenu)
      .filter((code) => !this.questions.some((question) => question.code === code))
      .map((code) => ({ motif: 'questionInconnue' as const, question: code }))

    const erreurs = this.questions.flatMap((question) => {
      const reponse = contenu[question.code]
      const posee = this.#estPosee(question, contenu, canal)
      if (reponse === undefined) {
        return posee && canal === 'en-ligne' ? [erreur('reponseManquante', question)] : []
      }
      if (!posee) {
        return [erreur('questionNonPosee', question)]
      }
      const motif = this.#motifInvalidite(question, reponse, contenu, canal)
      if (motif !== undefined) {
        return [erreur(motif, question)]
      }
      return canal === 'en-ligne' && !this.estRepondue(question, contenu, canal)
        ? [erreur('reponseManquante', question)]
        : []
    })

    return [...inconnues, ...erreurs]
  }

  #estPosee(question: Question, contenu: Contenu, canal: Canal): boolean {
    if (canal === 'papier') {
      return true
    }
    if (question.type === 'grille') {
      return this.lignesProposees(question, contenu, canal).length > 0
    }
    // Tant que la question qui commande la condition n'a pas de réponse, la question reste posée :
    // le nombre de questions annoncé ne peut que baisser.
    const { condition } = question
    return condition === undefined || contenu[condition.question] === undefined || estRemplie(condition, contenu)
  }

  #motifInvalidite(
    question: Question,
    reponse: ReponseQuestion,
    contenu: Contenu,
    canal: Canal
  ): MotifErreur | undefined {
    const autreTropLong = (reponse.autre ?? '').length > LONGUEUR_MAXIMALE.autre
    const textes = [reponse.pourquoi, reponse.lequelTexte]
    if (autreTropLong || textes.some((texte) => (texte ?? '').length > LONGUEUR_MAXIMALE.texte)) {
      return 'texteTropLong'
    }
    const valeurValide = this.#valeurValide(question, reponse.valeur, contenu, canal)
    const nettoyee = this.#nettoyerReponse(question, reponse, contenu, canal)
    return valeurValide && nettoyee !== undefined && memesPrecisions(reponse, nettoyee) ? undefined : 'reponseInvalide'
  }

  #nettoyerChoixMultiple(
    question: QuestionChoixMultiple,
    reponse: ReponseQuestion,
    contenu: Contenu,
    canal: Canal
  ): ReponseQuestion | undefined {
    if (!estListe(reponse.valeur)) {
      return undefined
    }
    const proposees = codes(this.optionsProposees(question, contenu, canal))
    const valeur = reponse.valeur.filter((code) => proposees.includes(code))
    if (valeur.length === 0) {
      return undefined
    }
    const autreCochee = question.optionAutre !== undefined && valeur.includes(question.optionAutre)
    return avecPrecisions({ valeur }, { autre: autreCochee ? reponse.autre : undefined })
  }

  #nettoyerChoixUnique(
    question: QuestionChoixUnique,
    reponse: ReponseQuestion,
    contenu: Contenu,
    canal: Canal
  ): ReponseQuestion | undefined {
    const { valeur } = reponse
    if (typeof valeur !== 'string' || valeur === '') {
      return undefined
    }
    const avecLequel = question.lequel !== undefined && valeur === question.lequel.siOption
    const equipements = codes(this.optionsLequel(question, contenu, canal))
    return avecPrecisions(
      { valeur },
      {
        autre: valeur === question.optionAutre ? reponse.autre : undefined,
        lequel: avecLequel ? reponse.lequel?.filter((code) => equipements.includes(code)) : undefined,
        lequelTexte: avecLequel ? reponse.lequelTexte : undefined,
        pourquoi: question.optionsPourquoi?.includes(valeur) === true ? reponse.pourquoi : undefined,
      }
    )
  }

  #nettoyerGrille(
    question: QuestionGrille,
    reponse: ReponseQuestion,
    contenu: Contenu,
    canal: Canal
  ): ReponseQuestion | undefined {
    const { valeur } = reponse
    if (!estObjet(valeur)) {
      return undefined
    }
    const lignes = codes(this.lignesProposees(question, contenu, canal))
    const conservees = Object.fromEntries(Object.entries(valeur).filter(([ligne]) => lignes.includes(ligne)))
    return Object.keys(conservees).length === 0 ? undefined : { valeur: conservees }
  }

  #nettoyerReponse(
    question: Question,
    reponse: ReponseQuestion,
    contenu: Contenu,
    canal: Canal
  ): ReponseQuestion | undefined {
    switch (question.type) {
      case 'choix-multiple':
        return this.#nettoyerChoixMultiple(question, reponse, contenu, canal)
      case 'choix-unique':
        return this.#nettoyerChoixUnique(question, reponse, contenu, canal)
      case 'code-postal':
      case 'echelle':
        return typeof reponse.valeur === 'string' && reponse.valeur !== '' ? { valeur: reponse.valeur } : undefined
      case 'grille':
        return this.#nettoyerGrille(question, reponse, contenu, canal)
    }
  }

  #valeurValide(question: Question, valeur: Valeur, contenu: Contenu, canal: Canal): boolean {
    const proposees = codes(this.optionsProposees(question, contenu, canal))
    switch (question.type) {
      case 'choix-multiple': {
        if (!estListe(valeur) || new Set(valeur).size !== valeur.length) {
          return false
        }
        const exclusive = question.optionExclusive
        const exclusiveAccompagnee = exclusive !== undefined && valeur.includes(exclusive) && valeur.length > 1
        return !exclusiveAccompagnee && valeur.every((code) => proposees.includes(code))
      }
      case 'choix-unique':
        return typeof valeur === 'string' && proposees.includes(valeur)
      case 'code-postal':
        return typeof valeur === 'string' && CODE_POSTAL.test(valeur)
      case 'echelle':
        return typeof valeur === 'string' && NIVEAUX_ECHELLE.includes(valeur)
      case 'grille': {
        const lignes = codes(this.lignesProposees(question, contenu, canal))
        return (
          estObjet(valeur) &&
          Object.entries(valeur).every(([ligne, option]) => lignes.includes(ligne) && proposees.includes(option))
        )
      }
    }
  }
}

// « Précisez » (après « Autre ») est court ; « Pourquoi ? » et « Lequel ? » laissent plus de place
export const LONGUEUR_MAXIMALE = { autre: 200, texte: 1000 } as const

export const NIVEAUX_ECHELLE: ReadonlyArray<string> = ['1', '2', '3', '4', '5']

export type Canal = 'en-ligne' | 'papier' | 'telephone'

// Condition portée par une question ou une option : remplie si la réponse à `question` contient
// au moins une des `reponsesParmi`.
export type Condition = Readonly<{
  question: string
  reponsesParmi: ReadonlyArray<string>
}>

export type Option = Readonly<{
  code: string
  condition?: Condition
  libelle: string
}>

export type Partie = Readonly<{
  code: CodePartie
  intro: string
  libelle: string
  titre: string
}>

export type QuestionChoixMultiple = QuestionCommune &
  Readonly<{
    optionAutre?: string
    optionExclusive?: string
    options: ReadonlyArray<Option>
    type: 'choix-multiple'
  }>

export type QuestionChoixUnique = QuestionCommune &
  Readonly<{
    // « Lequel/lesquels ? » : les options cochées à une autre question, si la réponse est `siOption`
    lequel?: Readonly<{ options: ReadonlyArray<Option>; parmiLesReponsesA: string; siOption: string }>
    optionAutre?: string
    options: ReadonlyArray<Option>
    optionsPourquoi?: ReadonlyArray<string>
    type: 'choix-unique'
  }>

export type QuestionCodePostal = QuestionCommune & Readonly<{ type: 'code-postal' }>

export type QuestionEchelle = QuestionCommune &
  Readonly<{
    poles: Readonly<{ maximum: string; minimum: string }>
    type: 'echelle'
  }>

export type QuestionGrille = QuestionCommune &
  Readonly<{
    // Lignes : les options cochées à une autre question, dans l'ordre de `options`
    lignes: Readonly<{ options: ReadonlyArray<Option>; parmiLesReponsesA: string }>
    options: ReadonlyArray<Option>
    type: 'grille'
  }>

export type Question =
  QuestionChoixMultiple | QuestionChoixUnique | QuestionCodePostal | QuestionEchelle | QuestionGrille

export type DefinitionQuestionnaire = Readonly<{
  parties: ReadonlyArray<Partie>
  questions: ReadonlyArray<Question>
  version: string
}>

// Valeur d'une réponse : code d'option (choix unique, échelle), codes d'options (choix multiple),
// option par ligne (grille) ou texte (code postal).
export type Valeur = Readonly<Record<string, string>> | ReadonlyArray<string> | string

export type ReponseQuestion = Readonly<{
  autre?: string
  lequel?: ReadonlyArray<string>
  lequelTexte?: string
  pourquoi?: string
  valeur: Valeur
}>

export type Contenu = Readonly<Partial<Record<string, ReponseQuestion>>>

type MotifErreur = 'questionInconnue' | 'questionNonPosee' | 'reponseInvalide' | 'reponseManquante' | 'texteTropLong'

type ErreurDeContenu = Readonly<{
  motif: MotifErreur
  question: string
}>

type CodePartie = 'bilan' | 'contexte' | 'vous'

type Precisions = Readonly<{
  autre?: string
  lequel?: ReadonlyArray<string>
  lequelTexte?: string
  pourquoi?: string
}>

type QuestionCommune = Readonly<{
  aide?: string
  code: string
  condition?: Condition
  partie: CodePartie
  titre: string
}>

const CODE_POSTAL = /^\d{5}$/

function erreur(motif: MotifErreur, question: Question): ErreurDeContenu {
  return { motif, question: question.code }
}

function estObjet(valeur: undefined | Valeur): valeur is Readonly<Record<string, string>> {
  return typeof valeur === 'object' && !Array.isArray(valeur)
}

function estRemplie(condition: Condition, contenu: Contenu): boolean {
  return reponsesA(contenu, condition.question).some((code) => condition.reponsesParmi.includes(code))
}

function reponsesA(contenu: Contenu, question: string): ReadonlyArray<string> {
  const valeur = contenu[question]?.valeur
  if (typeof valeur === 'string') {
    return [valeur]
  }
  return estListe(valeur) ? valeur : []
}

// Précisions (« Autre », « Pourquoi ? », « Lequel ? ») : un texte vide ou une liste vide n'est pas gardé
function avecPrecisions(reponse: Readonly<{ valeur: Valeur }>, precisions: Precisions): ReponseQuestion {
  const entrees = Object.entries(precisions) as ReadonlyArray<[string, ReadonlyArray<string> | string | undefined]>
  const gardees = entrees.filter(([, precision]) => precision !== undefined && precision.length > 0)
  return { ...reponse, ...Object.fromEntries(gardees) }
}

function codes(options: ReadonlyArray<Option>): ReadonlyArray<string> {
  return options.map((option) => option.code)
}

function estListe(valeur: undefined | Valeur): valeur is ReadonlyArray<string> {
  return Array.isArray(valeur)
}

function memesPrecisions(reponse: ReponseQuestion, nettoyee: ReponseQuestion): boolean {
  const champs = ['autre', 'pourquoi', 'lequelTexte'] as const
  const lequelIdentique = (reponse.lequel ?? []).length === (nettoyee.lequel ?? []).length
  return lequelIdentique && champs.every((champ) => (reponse[champ] ?? '') === (nettoyee[champ] ?? ''))
}
