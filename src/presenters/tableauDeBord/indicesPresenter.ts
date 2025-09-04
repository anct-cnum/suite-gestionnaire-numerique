export const FRAGILITE_COLORS = {
  1: '#4A6BAE',
  2: '#5F8EC7',
  3: '#AAC4E6',
  4: '#E6DEEE',
  5: '#EBB5BD',
  6: '#DD7480',
  7: '#D95C5E',
}

export const CONFIANCE_COLORS = {
  1: '#009081', // Objectifs sécurisés
  2: '#73E0CF', // Objectifs atteignables
  3: '#E2CF58', // Appuis nécessaires
  4: '#A558A0', // Objectifs compromis
  5: '#CECECE', // Objectifs non enregistrés
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

export type DepartementConfiance = Readonly<{
  codeDepartement: string
  couleur: string
  indiceConfiance: null | string
}>

export type DepartementData = Readonly<{
  codeDepartement: string
  couleur: string
  popup?: string
}>

export type DepartementsConfianceAvecStats = Readonly<{
  departements: Array<DepartementConfiance>
  statistiques: StatistiquesConfiance
}>

export function indiceConfianceDepartementsAvecStatsPresenter(data: Readonly<{
  departements: Array<Readonly<{
    codeDepartement: string
    indiceConfiance: null | string
  }>>
  statistiquesicp: {
    appuinecessaire: number
    atteignable: number
    compromis: number
    nonenregistres: number
    securise: number
  }
}>): DepartementsConfianceAvecStats {
  return {
    departements: indiceConfianceDepartementsPresenter(data.departements),
    statistiques: data.statistiquesicp,
  }
}

export function transformerDonneesCarteFrance(
  departementsFragilite: ReadonlyArray<DepartementFragilite>,
  departementsConfiance: ReadonlyArray<DepartementConfiance> | undefined,
  activeIndex: 'confiance' | 'fragilite'
): Array<DepartementData> {
  if (activeIndex === 'fragilite') {
    return departementsFragilite.map(dept => ({
      codeDepartement: dept.codeDepartement,
      couleur: dept.couleur,
      popup: `${dept.score}/10`,
    }))
  }
  
  if (departementsConfiance) {
    return departementsConfiance.map(dept => {
      let popup: string | undefined
      // Pas de popup pour les DOM/TOM
      if (!dept.codeDepartement.startsWith('97')) {
        popup = getPopupTextConfiance(dept.indiceConfiance)
      }
      const departementData: DepartementData = {
        codeDepartement: dept.codeDepartement,
        couleur: dept.couleur,
        popup,
      }
      
      return departementData
    })
  }
  
  return []
}

type StatistiquesConfiance = Readonly<{
  appuinecessaire: number
  atteignable: number
  compromis: number
  nonenregistres: number
  securise: number
}>

function indiceConfianceDepartementsPresenter(departements: ReadonlyArray<Readonly<{
  codeDepartement: string
  indiceConfiance: null | string
}>>): Array<DepartementConfiance> {
  return departements.map(departement => {
    const couleur = getCouleurConfiance(departement.indiceConfiance)
    
    return {
      codeDepartement: departement.codeDepartement,
      couleur,
      indiceConfiance: departement.indiceConfiance,
    }
  })
}

function getCouleurConfiance(indiceConfiance: null | string): string {
  switch (indiceConfiance) {
    case 'appuis nécessaires':
      return CONFIANCE_COLORS[3]
    case 'objectifs atteignables':
      return CONFIANCE_COLORS[2]
    case 'objectifs compromis':
      return CONFIANCE_COLORS[4]
    case 'objectifs sécurisés':
      return CONFIANCE_COLORS[1]
    case null:
    default:
      return CONFIANCE_COLORS[5]
  }
}

function getPopupTextConfiance(indiceConfiance: null | string): string {
  switch (indiceConfiance) {
    case 'appuis nécessaires':
      return 'Appuis nécessaires'
    case 'objectifs atteignables':
      return 'Atteignables'
    case 'objectifs compromis':
      return 'Compromis'
    case 'objectifs sécurisés':
      return 'Sécurisés'
    case null:
    default:
      return 'Non enregistrés'
  }
}

// il y a 7 couleurs pour un indice de 0 à 10
function getCouleurFragilite(indice: number): string {
  const nombreDeCouleurs = Object.keys(FRAGILITE_COLORS).length
  const nombreDIndice = 10

  const indiceDeCouleur = Math.max(1, Math.ceil(indice * nombreDeCouleurs / nombreDIndice))

  return FRAGILITE_COLORS[indiceDeCouleur as keyof typeof FRAGILITE_COLORS] || '#ffffff'
}
