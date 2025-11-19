export const FRAGILITE_COLORS = {
  1: '#4A6BAE',
  2: '#5F8EC7',
  3: '#AAC4E6',
  4: '#E6DEEE',
  5: '#EBB5BD',
  6: '#DD7480',
  7: '#D95C5E',
}

export function indiceFragilitePresenter(ifnCommunes: ReadonlyArray<Readonly<{
  codeInsee: string
  ifn: null | number
}>>): Array<CommuneFragilite> {
  return ifnCommunes.map(commune => ({
    codeInsee: commune.codeInsee,
    couleur: getCouleurFragilite(commune.ifn ?? 0),
    indice: Number((commune.ifn ?? 0).toFixed(2)),
  }))
}

export function indiceFragiliteDepartementsPresenter(departements: ReadonlyArray<Readonly<{
  codeDepartement: string
  ifn: number
}>>): Array<DepartementFragilite> {
  return departements.map(departement => ({
    codeDepartement: departement.codeDepartement,
    couleur: getCouleurFragilite(departement.ifn),
    score: Number(departement.ifn.toFixed(2)),
  }))
}

export type CommuneFragilite = Readonly<{
  codeInsee: string
  couleur: string
  indice: number
}>

export type DepartementFragilite = Readonly<{
  codeDepartement: string
  couleur: string
  score: number
}>

export type DepartementData = Readonly<{
  codeDepartement: string
  couleur: string
  popup?: string
}>

export function transformerDonneesCarteFrance(
  departementsFragilite: ReadonlyArray<DepartementFragilite>
): Array<DepartementData> {
  return departementsFragilite.map(dept => ({
    codeDepartement: dept.codeDepartement,
    couleur: dept.couleur,
    popup: `${dept.score}/10`,
  }))
}

// Transformer les données pour la carte France de la page Vitrine
export function transformerDonneesCarteFranceVitrine(): Array<DepartementData> {
  // Liste de tous les départements français (métropole + DOM-TOM)
  const departements = [
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '2A',
    '2B',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59',
    '60',
    '61',
    '62',
    '63',
    '64',
    '65',
    '66',
    '67',
    '68',
    '69',
    '70',
    '71',
    '72',
    '73',
    '74',
    '75',
    '76',
    '77',
    '78',
    '79',
    '80',
    '81',
    '82',
    '83',
    '84',
    '85',
    '86',
    '87',
    '88',
    '89',
    '90',
    '91',
    '92',
    '93',
    '94',
    '95',
    '971',
    '972',
    '973',
    '974',
    '976',
  ]

  return departements.map(codeDepartement => ({
    codeDepartement,
    couleur: '#8484F6',
    popup: '',
  }))
}

// il y a 7 couleurs pour un indice de 0 à 10
function getCouleurFragilite(indice: number): string {
  const nombreDeCouleurs = Object.keys(FRAGILITE_COLORS).length
  const nombreDIndice = 10

  const indiceDeCouleur = Math.max(1, Math.ceil(indice * nombreDeCouleurs / nombreDIndice))

  return FRAGILITE_COLORS[indiceDeCouleur as keyof typeof FRAGILITE_COLORS] || '#ffffff'
}
