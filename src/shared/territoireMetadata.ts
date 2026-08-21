import { Metadata } from 'next'

import departements from '../../ressources/departements.json'

/**
 * Génère les métadonnées SEO pour une page de données territoriales
 * @param nomTerritoire - Nom du territoire pour les niveaux region et epci
 */
export function generateTerritoireMetadata(
  niveau: string,
  codeDepartement: string | undefined,
  config: MetadataConfig,
  nomTerritoire?: string
): Metadata {
  const libelle = getLibelleTerritoire(niveau, codeDepartement, nomTerritoire)
  const libelleCourt = getLibelleTerritoireCourt(niveau, codeDepartement, nomTerritoire)
  const nomDepartement =
    codeDepartement !== undefined && codeDepartement !== '' ? getNomDepartement(codeDepartement) : undefined

  const title = config.titleTemplate
    .replace('{territoire}', libelleCourt)
    .replace('{departement}', nomDepartement ?? '')

  const description = config.descriptionTemplate
    .replace('{territoire}', libelle)
    .replace('{departement}', nomDepartement ?? '')

  const keywords = [...config.keywords]
  if (nomDepartement !== undefined && codeDepartement !== undefined) {
    keywords.push(nomDepartement, `département ${codeDepartement}`)
  }

  return {
    description,
    keywords,
    openGraph: {
      description,
      locale: 'fr_FR',
      siteName: 'Inclusion Numérique',
      title,
      type: 'website',
    },
    robots: {
      follow: true,
      index: true,
    },
    title,
  }
}

type DepartementJson = Readonly<{
  code: string
  nom: string
  regionCode: string
}>

type MetadataConfig = Readonly<{
  descriptionTemplate: string
  keywords: ReadonlyArray<string>
  titleTemplate: string
}>

/**
 * Génère le libellé du territoire pour les métadonnées
 * @example "le département du Rhône (69)" ou "la France"
 */
function getLibelleTerritoire(niveau: string, codeDepartement: string | undefined, nomTerritoire?: string): string {
  if (niveau === 'national') {
    return 'la France'
  }

  if (niveau === 'departement' && codeDepartement !== undefined && codeDepartement !== '') {
    const nomDepartement = getNomDepartement(codeDepartement)
    if (nomDepartement !== undefined) {
      return `le département ${nomDepartement} (${codeDepartement})`
    }
  }

  if (niveau === 'region' && nomTerritoire !== undefined) {
    return `la région ${nomTerritoire}`
  }

  if (niveau === 'epci' && nomTerritoire !== undefined) {
    return `l'intercommunalité ${nomTerritoire}`
  }

  return 'le territoire'
}

/**
 * Génère le libellé court du territoire
 * @example "Rhône (69)" ou "France"
 */
function getLibelleTerritoireCourt(
  niveau: string,
  codeDepartement: string | undefined,
  nomTerritoire?: string
): string {
  if (niveau === 'national') {
    return 'France'
  }

  if (niveau === 'departement' && codeDepartement !== undefined && codeDepartement !== '') {
    const nomDepartement = getNomDepartement(codeDepartement)
    if (nomDepartement !== undefined) {
      return `${nomDepartement} (${codeDepartement})`
    }
  }

  if ((niveau === 'region' || niveau === 'epci') && nomTerritoire !== undefined) {
    return nomTerritoire
  }

  return ''
}

/**
 * Récupère le nom d'un département à partir de son code
 */
function getNomDepartement(codeDepartement: string): string | undefined {
  const departement = (departements as ReadonlyArray<DepartementJson>).find((dept) => dept.code === codeDepartement)
  return departement?.nom
}
