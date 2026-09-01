// Article contracté devant un nom de département : « du Rhône », « de l’Ain », « de la Saône-et-Loire »,
// « des Vosges », « de Paris ».
export function duDepartement(departement: Readonly<{ code: string; nom: string }>): string {
  if (departementsSansArticle.has(departement.code)) {
    return `de ${departement.nom}`
  }
  if (departementsAuPluriel.has(departement.code)) {
    return `des ${departement.nom}`
  }
  if (departementsAvecElision.has(departement.code)) {
    return `de l’${departement.nom}`
  }
  if (departementsMasculins.has(departement.code)) {
    return `du ${departement.nom}`
  }
  return `de la ${departement.nom}`
}

// Départements dont le nom s’emploie sans article (« de Paris », « de La Réunion »).
const departementsSansArticle: ReadonlySet<string> = new Set(['75', '974', '976'])

// Départements dont le nom est au pluriel (« des Vosges »).
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

// Départements dont le nom s’élide (« de l’Ain », « de l’Hérault »).
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

// Départements masculins à initiale consonantique (« du Rhône ») ; le féminin (« de la ») est le cas par
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
