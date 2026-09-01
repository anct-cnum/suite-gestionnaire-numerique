import departements from '../../../ressources/departements.json'

export function noticeEpciMultiDepartementsPresenter(
  epci: Readonly<{ codeDepartement: null | string; nombreDepartements: number }>
): NoticeEpciMultiDepartementsViewModel | null {
  if (epci.nombreDepartements < 2 || epci.codeDepartement === null) {
    return null
  }
  const departement = departements.find((unDepartement) => unDepartement.code === epci.codeDepartement)
  if (departement === undefined) {
    return null
  }
  return {
    description:
      'Les données présentées couvrent l’ensemble de ses communes,' +
      ` y compris celles situées ${horsDuDepartement(departement)}.`,
    titre: `Cette intercommunalité s’étend sur ${epci.nombreDepartements} départements.`,
  }
}

export type NoticeEpciMultiDepartementsViewModel = Readonly<{
  description: string
  titre: string
}>

// Départements dont le nom s’emploie sans article (« hors de Paris », « hors de La Réunion »).
const departementsSansArticle: ReadonlySet<string> = new Set(['75', '974', '976'])

// Départements dont le nom est au pluriel (« hors des Vosges »).
const departementsAuPluriel: ReadonlySet<string> = new Set([
  '04',
  '05',
  '06',
  '08',
  '13',
  '22',
  '40',
  '64',
  '65',
  '66',
  '78',
  '79',
  '88',
  '92',
])

// Départements dont le nom s’élide (« hors de l’Ain », « hors de l’Hérault »).
const departementsAvecElision: ReadonlySet<string> = new Set([
  '01',
  '02',
  '03',
  '07',
  '09',
  '10',
  '11',
  '12',
  '27',
  '28',
  '34',
  '35',
  '36',
  '37',
  '38',
  '60',
  '61',
  '89',
  '91',
])

// Départements masculins à initiale consonantique (« hors du Rhône ») ; le féminin (« hors de la ») est le cas par
// défaut.
const departementsMasculins: ReadonlySet<string> = new Set([
  '14',
  '15',
  '18',
  '25',
  '29',
  '30',
  '32',
  '39',
  '41',
  '45',
  '46',
  '47',
  '49',
  '56',
  '59',
  '62',
  '63',
  '67',
  '68',
  '69',
  '81',
  '82',
  '83',
  '84',
  '90',
  '94',
  '95',
])

function horsDuDepartement(departement: Readonly<{ code: string; nom: string }>): string {
  if (departementsSansArticle.has(departement.code)) {
    return `hors de ${departement.nom}`
  }
  if (departementsAuPluriel.has(departement.code)) {
    return `hors des ${departement.nom}`
  }
  if (departementsAvecElision.has(departement.code)) {
    return `hors de l’${departement.nom}`
  }
  if (departementsMasculins.has(departement.code)) {
    return `hors du ${departement.nom}`
  }
  return `hors de la ${departement.nom}`
}
