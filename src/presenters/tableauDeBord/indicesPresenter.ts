const FRAGILITE_COLORS = {
  1: '#4A6BAE',
  2: '#5F8EC7',
  3: '#AAC4E6',
  4: '#E6DEEE',
  5: '#EBB5BD',
  6: '#DD7480',
  7: '#D95C5E',
}

// Gris distinct des 7 classes : un territoire sans indice ne doit pas passer pour « risque très faible ».
export const COULEUR_DONNEE_NON_DISPONIBLE = '#929292'

// Les 7 classes de l'indice, calculées sur l'indice arrondi à une décimale (celui qui est affiché).
// Libellé d'une classe : à modifier ici seulement.
export const CLASSES_FRAGILITE: ReadonlyArray<ClasseFragilite> = [
  { couleur: FRAGILITE_COLORS[1], libelle: 'Risque très faible', numero: 1, tranche: '0 à 1,4' },
  { couleur: FRAGILITE_COLORS[2], libelle: 'Risque faible', numero: 2, tranche: '1,5 à 2,8' },
  { couleur: FRAGILITE_COLORS[3], libelle: 'Risque assez faible', numero: 3, tranche: '2,9 à 4,2' },
  { couleur: FRAGILITE_COLORS[4], libelle: 'Risque moyen', numero: 4, tranche: '4,3 à 5,7' },
  { couleur: FRAGILITE_COLORS[5], libelle: 'Risque assez fort', numero: 5, tranche: '5,8 à 7,1' },
  { couleur: FRAGILITE_COLORS[6], libelle: 'Risque fort', numero: 6, tranche: '7,2 à 8,5' },
  { couleur: FRAGILITE_COLORS[7], libelle: 'Risque très fort', numero: 7, tranche: '8,6 à 10' },
]

export const CLASSE_DONNEE_NON_DISPONIBLE: ClasseFragilite = {
  couleur: COULEUR_DONNEE_NON_DISPONIBLE,
  libelle: 'Donnée non disponible',
  numero: 0,
  tranche: 'non disponible',
}

export function indiceFragilitePresenter(
  ifnCommunes: ReadonlyArray<
    Readonly<{
      codeInsee: string
      ifn: null | number
      nom?: string
    }>
  >
): Array<CommuneFragilite> {
  return ifnCommunes.map((commune) => {
    const indice = indiceArrondi(commune.ifn)
    const classe = classeDeLIndice(indice)
    return {
      classe,
      codeInsee: commune.codeInsee,
      couleur: classe.couleur,
      indice,
      indiceAffiche: formaterIndice(indice),
      nom: commune.nom ?? commune.codeInsee,
      nomConnu: commune.nom !== undefined,
    }
  })
}

export function indiceFragiliteDepartementsPresenter(
  departements: ReadonlyArray<
    Readonly<{
      codeDepartement: string
      ifn: null | number
      nom?: string
    }>
  >
): Array<DepartementFragilite> {
  return departements.map((departement) => {
    const indice = indiceArrondi(departement.ifn)
    const classe = classeDeLIndice(indice)
    return {
      classe,
      codeDepartement: departement.codeDepartement,
      couleur: classe.couleur,
      indiceAffiche: formaterIndice(indice),
      nom: departement.nom ?? departement.codeDepartement,
      nomConnu: departement.nom !== undefined,
      score: indice,
    }
  })
}

export function lignesTableauFragilite(
  fragilite: ReadonlyArray<CommuneFragilite | DepartementFragilite>
): ReadonlyArray<LigneTableauFragilite> {
  const lignes = fragilite.map((zone) =>
    'codeInsee' in zone
      ? {
          classe: zone.classe,
          code: zone.codeInsee,
          indice: zone.indice,
          indiceAffiche: zone.indiceAffiche,
          territoire: zone.nom,
          territoireConnu: zone.nomConnu,
        }
      : {
          classe: zone.classe,
          code: zone.codeDepartement,
          indice: zone.score,
          indiceAffiche: zone.indiceAffiche,
          territoire: zone.nomConnu ? `${zone.nom} (${zone.codeDepartement})` : zone.codeDepartement,
          territoireConnu: zone.nomConnu,
        }
  )
  return trierLignesFragilite(lignes, { colonne: 'territoire', sens: 'ascending' })
}

// Tri du tableau : les territoires sans nom (codes INSEE disparus) et les indices non disponibles
// restent en fin de tableau, quel que soit le sens du tri.
export function trierLignesFragilite(
  lignes: ReadonlyArray<LigneTableauFragilite>,
  tri: TriFragilite
): ReadonlyArray<LigneTableauFragilite> {
  const sens = tri.sens === 'ascending' ? 1 : -1
  return lignes.toSorted((ligneA, ligneB) => {
    if (tri.colonne === 'indice') {
      if (ligneA.indice === null || ligneB.indice === null) {
        return Number(ligneA.indice === null) - Number(ligneB.indice === null) || comparerTerritoires(ligneA, ligneB)
      }
      return sens * (ligneA.indice - ligneB.indice) || comparerTerritoires(ligneA, ligneB)
    }
    if (ligneA.territoireConnu !== ligneB.territoireConnu) {
      return ligneA.territoireConnu ? -1 : 1
    }
    return ligneA.territoireConnu ? sens * comparerTerritoires(ligneA, ligneB) : comparerTerritoires(ligneA, ligneB)
  })
}

export function syntheseFragilite(
  lignes: ReadonlyArray<LigneTableauFragilite>,
  territoire: Readonly<{ pluriel: string; singulier: string }>
): string {
  const parClasse = [...CLASSES_FRAGILITE, CLASSE_DONNEE_NON_DISPONIBLE]
    .map((classe) => ({
      classe,
      nombre: lignes.filter((ligne) => ligne.classe.numero === classe.numero).length,
    }))
    .filter(({ nombre }) => nombre > 0)
    .map(({ classe, nombre }) =>
      classe === CLASSE_DONNEE_NON_DISPONIBLE
        ? `${nombre} sans donnée disponible`
        : `${nombre} en ${classe.libelle.toLocaleLowerCase('fr-FR')}`
    )
  const nomDuTerritoire = lignes.length > 1 ? territoire.pluriel : territoire.singulier
  const detail = parClasse.length > 0 ? ` : ${parClasse.join(', ')}` : ''
  return `${lignes.length} ${nomDuTerritoire}${detail}.`
}

export type ClasseFragilite = Readonly<{
  couleur: string
  libelle: string
  numero: number
  tranche: string
}>

export type TriFragilite = Readonly<{
  colonne: 'indice' | 'territoire'
  sens: 'ascending' | 'descending'
}>

export type LigneTableauFragilite = Readonly<{
  classe: ClasseFragilite
  code: string
  indice: null | number
  indiceAffiche: string
  territoire: string
  territoireConnu: boolean
}>

export type CommuneFragilite = Readonly<{
  classe: ClasseFragilite
  codeInsee: string
  couleur: string
  indice: null | number
  indiceAffiche: string
  nom: string
  nomConnu: boolean
}>

export type DepartementFragilite = Readonly<{
  classe: ClasseFragilite
  codeDepartement: string
  couleur: string
  indiceAffiche: string
  nom: string
  nomConnu: boolean
  score: null | number
}>

export type DepartementData = Readonly<{
  codeDepartement: string
  couleur: string
  popup?: string
}>

export function transformerDonneesCarteFrance(
  departementsFragilite: ReadonlyArray<DepartementFragilite>
): Array<DepartementData> {
  return departementsFragilite.map((dept) => ({
    codeDepartement: dept.codeDepartement,
    couleur: dept.couleur,
    popup: dept.score === null ? 'Indice non disponible' : `${dept.indiceAffiche}/10`,
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

  return departements.map((codeDepartement) => ({
    codeDepartement,
    couleur: '#8484F6',
    popup: '',
  }))
}

function indiceArrondi(ifn: null | number): null | number {
  return ifn === null ? null : Math.round(ifn * 10) / 10
}

// Même règle que les couleurs d'origine, ceil(indice × 7 / 10), appliquée à l'indice arrondi, en dixièmes entiers
// pour éviter les erreurs d'arrondi : 7,1 est toujours dans la classe 5 et 7,2 dans la classe 6.
function classeDeLIndice(indice: null | number): ClasseFragilite {
  if (indice === null) {
    return CLASSE_DONNEE_NON_DISPONIBLE
  }
  const dixiemes = Math.round(indice * 10)
  const nombreDeClasses = CLASSES_FRAGILITE.length
  const numero = Math.min(nombreDeClasses, Math.max(1, Math.ceil((dixiemes * nombreDeClasses) / 100)))
  return CLASSES_FRAGILITE[numero - 1]
}

function formaterIndice(indice: null | number): string {
  return indice === null ? 'non disponible' : indice.toLocaleString('fr-FR', { maximumFractionDigits: 1 })
}

function comparerTerritoires(ligneA: LigneTableauFragilite, ligneB: LigneTableauFragilite): number {
  return ligneA.territoire.localeCompare(ligneB.territoire, 'fr')
}
