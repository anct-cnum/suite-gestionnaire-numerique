import departements from '../../ressources/departements.json'
import epci from '../../ressources/epci.json'
import regions from '../../ressources/regions.json'
import {
  TerritoiresTrouvesReadModel,
  TypeTerritoire,
  UnTerritoireTrouveReadModel,
} from '@/use-cases/queries/RechercherTerritoires'

const libellesDesGroupes: Readonly<Record<TypeTerritoire, string>> = {
  departement: 'Départements',
  epci: 'Intercommunalités',
  region: 'Régions',
}

const ordreDesGroupes: ReadonlyArray<TypeTerritoire> = ['region', 'departement', 'epci']

// Nom du paramètre d'URL de filtrage géographique associé à chaque type de territoire.
export const cleGeographiqueParType: Readonly<Record<TypeTerritoire, 'codeDepartement' | 'codeEpci' | 'codeRegion'>> = {
  departement: 'codeDepartement',
  epci: 'codeEpci',
  region: 'codeRegion',
}

export function rechercheTerritoiresPresenter(readModel: TerritoiresTrouvesReadModel): RechercheTerritoiresViewModel {
  return {
    groupes: ordreDesGroupes
      .map((type) => ({
        label: libellesDesGroupes[type],
        options: readModel.territoires.filter((territoire) => territoire.type === type).map(versOption),
      }))
      .filter((groupe) => groupe.options.length > 0),
    nombreAffiche: readModel.territoires.length,
    total: readModel.total,
  }
}

// Reconstruit le territoire sélectionné depuis les paramètres d'URL (libellés via les listes statiques).
export function territoireDepuisCodes(codes: CodesTerritoire): null | TerritoireViewModel {
  if (codes.codeEpci !== null && codes.codeEpci !== '') {
    const unEpci = epci.find((candidat) => candidat.code === codes.codeEpci)
    return {
      code: codes.codeEpci,
      label: unEpci?.nom ?? codes.codeEpci,
      type: 'epci',
      value: `epci-${codes.codeEpci}`,
    }
  }
  if (codes.codeDepartement !== null && codes.codeDepartement !== '') {
    const departement = departements.find((candidat) => candidat.code === codes.codeDepartement)
    return {
      code: codes.codeDepartement,
      label: departement === undefined ? codes.codeDepartement : `${departement.nom} · ${codes.codeDepartement}`,
      type: 'departement',
      value: `departement-${codes.codeDepartement}`,
    }
  }
  if (codes.codeRegion !== null && codes.codeRegion !== '') {
    const region = regions.find((candidat) => candidat.code === codes.codeRegion)
    return {
      code: codes.codeRegion,
      label: region?.nom ?? codes.codeRegion,
      type: 'region',
      value: `region-${codes.codeRegion}`,
    }
  }
  return null
}

export type TerritoireViewModel = Readonly<{
  code: string
  label: string
  type: TypeTerritoire
  value: string
}>

type CodesTerritoire = Readonly<{
  codeDepartement: null | string
  codeEpci: null | string
  codeRegion: null | string
}>

type RechercheTerritoiresViewModel = Readonly<{
  groupes: ReadonlyArray<GroupeDeTerritoiresViewModel>
  nombreAffiche: number
  total: number
}>

type GroupeDeTerritoiresViewModel = Readonly<{
  label: string
  options: ReadonlyArray<TerritoireViewModel>
}>

function versOption(territoire: UnTerritoireTrouveReadModel): TerritoireViewModel {
  return {
    code: territoire.code,
    label:
      territoire.numeroDepartement === null ? territoire.nom : `${territoire.nom} · ${territoire.numeroDepartement}`,
    type: territoire.type,
    value: `${territoire.type}-${territoire.code}`,
  }
}
