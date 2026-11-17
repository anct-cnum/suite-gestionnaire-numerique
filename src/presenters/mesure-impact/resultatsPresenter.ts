import { dateLongue, pluriel } from './format'
import { ResultatsReadModel } from '@/use-cases/mesure-impact/RecupererLesResultats'

// Pourcentages arrondis à l'unité, rapportés à la base de chaque question (maquette 08c)
export function resultatsPresenter(readModel: ResultatsReadModel): ResultatsViewModel {
  const { campagne, filtres, optionsDeFiltre, resultats } = readModel
  const { chiffresCles } = resultats
  return {
    chiffresCles: [
      {
        libelle: 'se sentent plus à l’aise avec le numérique après leurs accompagnements',
        valeur: part(chiffresCles.plusALAise),
      },
      { libelle: 'arrivent à faire de nouvelles choses avec le numérique', valeur: part(chiffresCles.nouvellesChoses) },
      { libelle: 'ont le sentiment d’avoir progressé', valeur: part(chiffresCles.progres) },
    ],
    filtres: {
      canal: {
        options: [{ label: 'Tous', value: '' }, ...CANAUX],
        valeur: filtres.canal ?? '',
      },
      codePostal: {
        options: [
          { label: 'Tout le territoire', value: '' },
          ...optionsDeFiltre.codesPostaux.map((codePostal) => ({ label: codePostal, value: codePostal })),
        ],
        valeur: filtres.codePostal ?? '',
      },
      mois: {
        options: [
          { label: 'Toute la campagne', value: '' },
          ...optionsDeFiltre.mois.map((mois) => ({ label: libelleDuMois(mois), value: mois })),
        ],
        valeur: filtres.mois ?? '',
      },
    },
    introduction: `${campagne.nom}, collecte commencée le ${dateLongue(campagne.ouverture)}.`,
    lienCampagne: `/mesure-impact/${campagne.identifiantPublic}`,
    onglets: ONGLETS.map(({ id, libelle }) => ({
      id,
      libelle,
      questions: resultats.questions.filter((question) => question.partie === id).map(questionPresentee),
    })),
    titre: `Résultats · ${campagne.libelleTerritoire}`,
    titreFilAriane: campagne.libelleTerritoire,
    total: `Total : ${resultats.total === 0 ? 'aucune réponse' : pluriel(resultats.total, 'réponse', 'réponses')}`,
  }
}

const CANAUX: ReadonlyArray<Option> = [
  { label: 'En ligne', value: 'en-ligne' },
  { label: 'Papier', value: 'papier' },
  { label: 'Téléphone', value: 'telephone' },
]

const ONGLETS: ReadonlyArray<Readonly<{ id: Partie; libelle: string }>> = [
  { id: 'bilan', libelle: 'Le bilan des accompagnements' },
  { id: 'contexte', libelle: 'Le contexte des accompagnements' },
  { id: 'vous', libelle: 'Les personnes accompagnées' },
]

const TITRE_AVANT_APRES = 'Comment vous sentiez-vous avec le numérique, avant et après ces accompagnements ?'

const BASE_GRILLE = 'Base : par équipement, les répondants qui l’ont utilisé pendant les accompagnements'

export type QuestionViewModel =
  | Readonly<{
      base: string
      cle: string
      colonnes: ReadonlyArray<string>
      lignes: ReadonlyArray<Readonly<{ base: string; libelle: string; parts: ReadonlyArray<string> }>>
      surtitre: string
      titre: string
      type: 'grille'
    }>
  | Readonly<{
      base: string
      cle: string
      lignes: ReadonlyArray<Readonly<{ libelle: string; part: string; pourcentage: number }>>
      surtitre: string
      titre: string
      type: 'repartition'
    }>
  | Readonly<{
      base: string
      cle: string
      niveaux: ReadonlyArray<
        Readonly<{
          apres: string
          apresPourcentage: number
          avant: string
          avantPourcentage: number
          differentiel: string
          libelle: string
        }>
      >
      surtitre: string
      titre: string
      type: 'avant-apres'
    }>

export type ResultatsViewModel = Readonly<{
  chiffresCles: ReadonlyArray<Readonly<{ libelle: string; valeur: string }>>
  filtres: Readonly<{ canal: Filtre; codePostal: Filtre; mois: Filtre }>
  introduction: string
  lienCampagne: string
  onglets: ReadonlyArray<Readonly<{ id: Partie; libelle: string; questions: ReadonlyArray<QuestionViewModel> }>>
  titre: string
  titreFilAriane: string
  total: string
}>

function questionPresentee(question: ResultatQuestion): QuestionViewModel {
  switch (question.type) {
    case 'avant-apres': {
      const [avant, apres] = question.numeros
      return {
        base: `Base : ${repondants(question.base)} ayant répondu aux deux questions · différentiel = après − avant, en points`,
        cle: question.codes.join('-'),
        niveaux: question.niveaux.map(({ apres: nombreApres, avant: nombreAvant, niveau }, index) => {
          const avantPourcentage = pourcentage(nombreAvant, question.base)
          const apresPourcentage = pourcentage(nombreApres, question.base)
          return {
            apres: `${apresPourcentage} %`,
            apresPourcentage,
            avant: `${avantPourcentage} %`,
            avantPourcentage,
            differentiel: points(apresPourcentage - avantPourcentage),
            libelle: libelleDuNiveau(niveau, index, question.niveaux.length, question.poles),
          }
        }),
        surtitre: `Questions ${avant} et ${apres}`,
        titre: TITRE_AVANT_APRES,
        type: 'avant-apres',
      }
    }
    case 'grille':
      return {
        base: BASE_GRILLE,
        cle: question.code,
        colonnes: question.lignes[0]?.options.map(({ libelle }) => libelle) ?? [],
        lignes: question.lignes.map((ligne) => ({
          base: ligne.base === 0 ? 'Aucun répondant' : repondants(ligne.base),
          libelle: ligne.libelle,
          parts: ligne.options.map(({ nombre }) => part({ base: ligne.base, nombre })),
        })),
        surtitre: `Question ${question.numero}`,
        titre: question.titre,
        type: 'grille',
      }
    case 'repartition': {
      // Une liste à choix multiple ou de codes postaux se lit par fréquence ; une échelle de réponses, dans son ordre
      const triee = question.multiple || question.options.every(({ code, libelle }) => code === libelle)
      const options = triee ? question.options.toSorted((une, autre) => autre.nombre - une.nombre) : question.options
      return {
        base: baseDeLaRepartition(question),
        cle: question.code,
        lignes: options.map(({ libelle, nombre }) => {
          const valeur = pourcentage(nombre, question.base)
          return { libelle, part: `${valeur} %`, pourcentage: valeur }
        }),
        surtitre: `Question ${question.numero}`,
        titre: question.titre,
        type: 'repartition',
      }
    }
  }
}

function baseDeLaRepartition(question: Extract<ResultatQuestion, { type: 'repartition' }>): string {
  const reponses = question.condition?.reponses.map((reponse) => `« ${reponse} »`).join(' ou ')
  const condition =
    question.condition === undefined ? '' : ` ayant répondu ${reponses} à la question ${question.condition.numero}`
  const multiple = question.multiple ? ' · plusieurs réponses possibles' : ''
  return `Base : ${repondants(question.base)}${condition}${multiple}`
}

function libelleDuNiveau(niveau: string, index: number, nombre: number, poles: Poles): string {
  if (index === 0) {
    return `${niveau} · ${poles.minimum}`
  }
  return index === nombre - 1 ? `${niveau} · ${poles.maximum}` : niveau
}

function libelleDuMois(mois: string): string {
  const [annee, numero] = mois.split('-').map(Number)
  const libelle = new Date(Date.UTC(annee, numero - 1, 15)).toLocaleDateString('fr-FR', {
    month: 'long',
    timeZone: 'UTC',
    year: 'numeric',
  })
  return libelle.charAt(0).toUpperCase() + libelle.slice(1)
}

function part({ base, nombre }: Readonly<{ base: number; nombre: number }>): string {
  return base === 0 ? '–' : `${pourcentage(nombre, base)} %`
}

function pourcentage(nombre: number, base: number): number {
  return base === 0 ? 0 : Math.round((nombre * 100) / base)
}

function points(ecart: number): string {
  if (ecart === 0) {
    return '0 pt'
  }
  return ecart > 0 ? `+${ecart} pts` : `−${-ecart} pts`
}

function repondants(nombre: number): string {
  return pluriel(nombre, 'répondant', 'répondants')
}

type ResultatQuestion = ResultatsReadModel['resultats']['questions'][number]

type Partie = ResultatQuestion['partie']

type Poles = Extract<ResultatQuestion, { type: 'avant-apres' }>['poles']

type Option = Readonly<{ label: string; value: string }>

type Filtre = Readonly<{ options: ReadonlyArray<Option>; valeur: string }>
