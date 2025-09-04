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
  indiceConfiance: string | null
}>

export type DepartementData = Readonly<{
  codeDepartement: string
  couleur: string
  score: number
}>

export type StatistiquesConfiance = Readonly<{
  securise: number
  appuinecessaire: number
  atteignable: number
  compromis: number
  nonenregistres: number
}>

export type DepartementsConfianceAvecStats = Readonly<{
  statistiques: StatistiquesConfiance
  departements: Array<DepartementConfiance>
}>

export function indiceConfianceDepartementsAvecStatsPresenter(data: Readonly<{
  statistiquesicp: {
    securise: number
    appuinecessaire: number
    atteignable: number
    compromis: number
    nonenregistres: number
  }
  departements: Array<Readonly<{
    codeDepartement: string
    indiceConfiance: string | null
  }>>
}>): DepartementsConfianceAvecStats {
  return {
    statistiques: data.statistiquesicp,
    departements: indiceConfianceDepartementsPresenter(data.departements),
  }
}

export function indiceConfianceDepartementsPresenter(departements: ReadonlyArray<Readonly<{
  codeDepartement: string
  indiceConfiance: string | null
}>>): Array<DepartementConfiance> {
  return departements.map(departement => {
    let couleur = CONFIANCE_COLORS[5] // Par défaut : non enregistré
    
    switch (departement.indiceConfiance) {
      case 'objectifs sécurisés':
        couleur = CONFIANCE_COLORS[1]
        break
      case 'objectifs atteignables':
        couleur = CONFIANCE_COLORS[2]
        break
      case 'appuis nécessaires':
        couleur = CONFIANCE_COLORS[3]
        break
      case 'objectifs compromis':
        couleur = CONFIANCE_COLORS[4]
        break
      default:
        couleur = CONFIANCE_COLORS[5]
    }
    
    return {
      codeDepartement: departement.codeDepartement,
      couleur,
      indiceConfiance: departement.indiceConfiance,
    }
  })
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
      score: dept.score,
    }))
  }
  
  if (departementsConfiance) {
    return departementsConfiance.map(dept => {
      // Map le label vers un score numérique pour l'affichage
      let score = 5 // Par défaut : non enregistré
      switch (dept.indiceConfiance) {
        case 'objectifs sécurisés':
          score = 1
          break
        case 'objectifs atteignables':
          score = 2
          break
        case 'appuis nécessaires':
          score = 3
          break
        case 'objectifs compromis':
          score = 4
          break
      }
      
      return {
        codeDepartement: dept.codeDepartement,
        couleur: dept.couleur,
        score,
      }
    })
  }
  
  return []
}

// il y a 7 couleurs pour un indice de 0 à 10
function getCouleurFragilite(indice: number): string {
  const nombreDeCouleurs = Object.keys(FRAGILITE_COLORS).length
  const nombreDIndice = 10

  const indiceDeCouleur = Math.max(1, Math.ceil(indice * nombreDeCouleurs / nombreDIndice))

  return FRAGILITE_COLORS[indiceDeCouleur as keyof typeof FRAGILITE_COLORS] || '#ffffff'
}
