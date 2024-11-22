import departements from '../../ressources/departements.json'
import regions from '../../ressources/regions.json'

export function urlDeFiltrage(form: FormData, totalDesRoles: number): URL {
  const utilisateursActives = form.get('utilisateursActives')
  const isUtilisateursActivesChecked = utilisateursActives === 'on'
  const zoneGeographique = String(form.get('zoneGeographique'))
  // Stryker disable next-line ConditionalExpression
  const isZoneGeographiqueSelected = zoneGeographique !== '' && zoneGeographique !== valeurParDefautDeToutesLesRegions
  const roles = form.getAll('roles')
  const shouldFilterByRoles = roles.length < totalDesRoles

  const url = new URL('/mes-utilisateurs', process.env.NEXT_PUBLIC_HOST)

  if (isUtilisateursActivesChecked) {
    url.searchParams.append('utilisateursActives', utilisateursActives)
  }

  if (isZoneGeographiqueSelected) {
    const [codeRegion, codeDepartement] = laRegionOuLeDepartementSelectionne(zoneGeographique)

    if (isRegion(zoneGeographique)) {
      url.searchParams.append('codeRegion', codeRegion)
    } else {
      url.searchParams.append('codeDepartement', codeDepartement)
    }
  }

  if (shouldFilterByRoles) {
    url.searchParams.append('roles', roles.join(','))
  }

  return url
}

export function regionsEtDepartements(): ReadonlyArray<ZoneGeographique> {
  const regionsEtDepartements = [toutesLesRegions]

  regions.forEach((region) => {
    regionsEtDepartements.push({
      label: `(${region.code}) ${region.nom}`,
      type: 'region',
      value: `${region.code}${regionDepartementSeparator}${codeDepartementParDefautDuneRegion}`,
    })

    departements
      .filter((departement) => departement.regionCode === region.code)
      .forEach((departement) => {
        regionsEtDepartements.push({
          label: `(${departement.code}) ${departement.nom}`,
          type: 'departement',
          value: `${region.code}${regionDepartementSeparator}${departement.code}`,
        })
      })
  })

  return regionsEtDepartements
}

export function zoneGeographiqueParDefaut(codeRegion: string | null, codeDepartement: string | null): ZoneGeographique {
  return regionsEtDepartements().find(
    (regionEtDepartement) => {
      const [codeRegionSelectionnee, codeDepartementSelectionne] =
        laRegionOuLeDepartementSelectionne(regionEtDepartement.value)

      return codeRegionSelectionnee === codeRegion || codeDepartementSelectionne === codeDepartement
    }
  ) ?? toutesLesRegions
}

function laRegionOuLeDepartementSelectionne(zoneGeographique: string): ReadonlyArray<string> {
  return zoneGeographique.split('_')
}

function isRegion(zoneGeographique: string): boolean {
  return zoneGeographique.endsWith(codeDepartementParDefautDuneRegion)
}

const valeurParDefautDeToutesLesRegions = 'all'
export const toutesLesRegions: ZoneGeographique = { label: 'Toutes les régions', type: 'region', value: valeurParDefautDeToutesLesRegions }
const codeDepartementParDefautDuneRegion = '00'
const regionDepartementSeparator = '_'

export type ZoneGeographique = Readonly<{
  label: string
  type: 'region' | 'departement'
  value: string
}>
