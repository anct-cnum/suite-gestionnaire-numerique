import departements from '../../ressources/departements.json'
import regions from '../../ressources/regions.json'
import { isNullishOrEmpty } from '@/shared/lang'

export function urlDeFiltrage(form: FormData, totalDesRoles: number): URL {
  const utilisateursActives = form.get('utilisateursActives')
  const isUtilisateursActivesChecked = utilisateursActives === 'on'
  const zoneGeographique = String(form.get('zoneGeographique'))
  const selectedStructure = form.get('organisation')?.toString()
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

  if (!isNullishOrEmpty(selectedStructure)) {
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    url.searchParams.append('structure', selectedStructure!)
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

export function zoneGeographiqueToURLSearchParams(zoneGeographique: ZoneGeographique): URLSearchParams {
  const searchParams: Array<Array<string>> = []
  if (!isZoneParDefaut(zoneGeographique)) {
    const isDepartement = zoneGeographique.type === 'departement'
    const codesZone = laRegionOuLeDepartementSelectionne(zoneGeographique.value)
    searchParams.push([zoneGeographique.type, codesZone[+isDepartement]])
  }
  return new URLSearchParams(searchParams)
}

function laRegionOuLeDepartementSelectionne(zoneGeographique: string): ReadonlyArray<string> {
  return zoneGeographique.split(regionDepartementSeparator)
}

function isRegion(zoneGeographique: string): boolean {
  return zoneGeographique.endsWith(codeDepartementParDefautDuneRegion)
}

function isZoneParDefaut(zoneGeographique: ZoneGeographique): boolean {
  return JSON.stringify(toutesLesRegions) === JSON.stringify(zoneGeographique)
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
