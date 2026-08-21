import departements from '../../ressources/departements.json'
import regions from '../../ressources/regions.json'
import { isNullishOrEmpty } from '@/shared/lang'

export function urlDeFiltrage(form: FormData, totalDesRoles: number, territoire: null | TerritoireFiltre): URL {
  const utilisateursActives = form.get('utilisateursActives')
  const isUtilisateursActivesChecked = utilisateursActives === 'on'
  const selectedStructure = form.get('organisation') as string
  const roles = form.getAll('roles') as Array<string>
  const shouldFilterByRoles = roles.length < totalDesRoles

  const url = new URL('/mes-utilisateurs', process.env.NEXT_PUBLIC_HOST)

  if (isUtilisateursActivesChecked) {
    url.searchParams.append('utilisateursActives', utilisateursActives)
  }

  if (territoire !== null) {
    url.searchParams.append(cleGeographiqueParType[territoire.type], territoire.code)
  }

  if (shouldFilterByRoles) {
    url.searchParams.append('roles', roles.join(','))
  }

  if (!isNullishOrEmpty(selectedStructure)) {
    url.searchParams.append('structure', selectedStructure)
  }

  return url
}

export function regionsEtDepartements(): ReadonlyArray<ZoneGeographique> {
  const regionsEtDepartements = [toutesLesRegions]

  const regionsSorted = [...regions].sort((regionA, regionB) => regionA.nom.localeCompare(regionB.nom, 'fr'))

  regionsSorted.forEach((region) => {
    regionsEtDepartements.push({
      label: region.nom,
      type: 'region',
      value: `${region.code}${regionDepartementSeparator}${codeDepartementParDefautDuneRegion}`,
    })

    departements
      .filter((departement) => departement.regionCode === region.code)
      .sort((departementA, departementB) => departementA.nom.localeCompare(departementB.nom, 'fr'))
      .forEach((departement) => {
        regionsEtDepartements.push({
          label: departement.nom,
          type: 'departement',
          value: `${region.code}${regionDepartementSeparator}${departement.code}`,
        })
      })
  })

  return regionsEtDepartements
}

const toutesLesRegions: ZoneGeographique = {
  label: 'Toutes les régions',
  type: 'region',
  value: 'all',
}
const codeDepartementParDefautDuneRegion = '00'
const regionDepartementSeparator = '_'

// Duplication assumée de cleGeographiqueParType (presenters/rechercheTerritoiresPresenter) :
// un presenter ne peut pas importer un autre presenter (import/no-restricted-paths).
const cleGeographiqueParType = {
  departement: 'codeDepartement',
  epci: 'codeEpci',
  region: 'codeRegion',
} as const

type ZoneGeographique = Readonly<{
  label: string
  type: 'departement' | 'region'
  value: string
}>

// Forme structurelle minimale de TerritoireViewModel, pour la même raison.
type TerritoireFiltre = Readonly<{
  code: string
  type: 'departement' | 'epci' | 'region'
}>
