import { filtresEnParametres } from './filtresDesResultats'
import { pourcentage } from './format'
import { escapeCSV } from '@/shared/csv'
import { ResultatsReadModel } from '@/use-cases/mesure-impact/RecupererLesResultats'

// Résultats filtrés, une ligne par réponse de chaque question, dans l'ordre du questionnaire. La part est
// arrondie à l'unité, comme à l'écran ; vide quand personne n'a répondu. Les deux échelles avant/après gardent
// chacune leur numéro, sur la base commune des répondants aux deux. Suivent, après une ligne vide, les textes
// libres regroupés avec leur effectif.
export function resultatsCsvPresenter(readModel: ResultatsReadModel): ResultatsCsvViewModel {
  const { campagne, filtres, parties, resultats } = readModel
  const libelleDeLaPartie = new Map(parties.map(({ code, libelle }) => [code, libelle]))
  const reponses = resultats.questions.flatMap((question) =>
    lignesDeLaQuestion(question).map(({ base, nombre, numero, reponse, titre }) =>
      enLigne([
        libelleDeLaPartie.get(question.partie),
        numero,
        titre,
        reponse,
        nombre,
        base === 0 ? '' : pourcentage(nombre, base),
        base,
      ])
    )
  )
  const textes = resultats.textesLibres.map(({ champ, nombre, numero, partie, texte, titre }) =>
    enLigne([libelleDeLaPartie.get(partie), numero, titre, CHAMPS[champ], texte, nombre])
  )
  const tableaux = [
    [enLigne(ENTETE), ...reponses],
    ...(textes.length === 0 ? [] : [['', enLigne(ENTETE_DES_TEXTES), ...textes]]),
  ]
  return {
    contenu: `\uFEFF${tableaux.flat().join('\n')}`,
    nomDuFichier: `${['resultats', campagne.identifiantPublic, ...filtresEnParametres(filtres).map(([, valeur]) => valeur)].join('-')}.csv`,
  }
}

type ResultatsCsvViewModel = Readonly<{
  contenu: string
  nomDuFichier: string
}>

const ENTETE = ['Partie', 'Numéro', 'Question', 'Réponse', 'Effectif', 'Pourcentage', 'Base']

const ENTETE_DES_TEXTES = ['Partie', 'Numéro', 'Question', 'Champ', 'Texte', 'Effectif']

// Libellés des champs, tels que la personne les a vus
const CHAMPS: Readonly<Record<TexteLibre['champ'], string>> = {
  autre: 'Autre, précisez',
  lequelTexte: 'Lequel/lesquels ?',
  pourquoi: 'Pourquoi ?',
}

// Une valeur saisie librement ne peut pas devenir une formule dans le tableur (voir escapeCSV)
function enLigne(valeurs: ReadonlyArray<number | string | undefined>): string {
  return valeurs.map(escapeCSV).join(',')
}

function lignesDeLaQuestion(question: ResultatQuestion): ReadonlyArray<Ligne> {
  switch (question.type) {
    case 'avant-apres': {
      const { base, niveaux, numeros, poles, titres } = question
      return [
        ...niveaux.map(({ avant, niveau }, index) => ({
          base,
          nombre: avant,
          numero: numeros[0],
          reponse: niveauEtSonPole(niveau, index, niveaux.length, poles),
          titre: titres[0],
        })),
        ...niveaux.map(({ apres, niveau }, index) => ({
          base,
          nombre: apres,
          numero: numeros[1],
          reponse: niveauEtSonPole(niveau, index, niveaux.length, poles),
          titre: titres[1],
        })),
      ]
    }
    case 'grille':
      return question.lignes.flatMap((ligne) =>
        ligne.options.map(({ libelle, nombre }) => ({
          base: ligne.base,
          nombre,
          numero: question.numero,
          reponse: `${ligne.libelle} : ${libelle}`,
          titre: question.titre,
        }))
      )
    case 'repartition':
      return question.options.map(({ libelle, nombre }) => ({
        base: question.base,
        nombre,
        numero: question.numero,
        reponse: libelle,
        titre: question.titre,
      }))
  }
}

// Les extrémités de l'échelle disent leur sens : « 1 (Pas du tout à l’aise) »
function niveauEtSonPole(niveau: string, index: number, nombre: number, poles: Poles): string {
  if (index === 0) {
    return `${niveau} (${poles.minimum})`
  }
  return index === nombre - 1 ? `${niveau} (${poles.maximum})` : niveau
}

type Ligne = Readonly<{ base: number; nombre: number; numero: number; reponse: string; titre: string }>

type ResultatQuestion = ResultatsReadModel['resultats']['questions'][number]

type TexteLibre = ResultatsReadModel['resultats']['textesLibres'][number]

type Poles = Extract<ResultatQuestion, { type: 'avant-apres' }>['poles']
