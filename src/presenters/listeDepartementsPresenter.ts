import { DepartementsParRegionReadModel } from '@/use-cases/queries/ListerDepartementsParRegion'

// Régions d'outre-mer (un seul département chacune) : regroupées sous un titre commun en fin de liste.
const CODES_REGIONS_OUTRE_MER: ReadonlyArray<string> = ['01', '02', '03', '04', '06']

// Régions métropolitaines par ordre alphabétique, puis l'outre-mer ; départements par code dans chaque groupe.
export function listeDepartementsPresenter(readModel: DepartementsParRegionReadModel): ListeDepartementsViewModel {
  const [outreMer, metropole] = partitionner(readModel, (departement) =>
    CODES_REGIONS_OUTRE_MER.includes(departement.codeRegion)
  )

  const regions = [...new Set(metropole.map((departement) => departement.nomRegion))]
    .sort((premiere, seconde) => premiere.localeCompare(seconde, 'fr'))
    .map((nomRegion) => {
      const departements = metropole.filter((departement) => departement.nomRegion === nomRegion)
      return groupe(`departements-region-${departements[0].codeRegion}`, nomRegion, departements)
    })

  return outreMer.length === 0 ? regions : [...regions, groupe('departements-outre-mer', 'Outre-mer', outreMer)]
}

export type ListeDepartementsViewModel = ReadonlyArray<GroupeDepartementsViewModel>

type GroupeDepartementsViewModel = Readonly<{
  departements: ReadonlyArray<Readonly<{ libelle: string; lien: string }>>
  id: string
  titre: string
}>

type Departement = DepartementsParRegionReadModel[number]

function groupe(id: string, titre: string, departements: ReadonlyArray<Departement>): GroupeDepartementsViewModel {
  return {
    departements: [...departements]
      .sort((premier, second) => premier.codeDepartement.localeCompare(second.codeDepartement))
      .map((departement) => ({
        libelle: `${departement.nomDepartement} (${departement.codeDepartement})`,
        lien: `/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/${departement.codeDepartement}`,
      })),
    id,
    titre,
  }
}

function partitionner(
  departements: DepartementsParRegionReadModel,
  predicat: (departement: Departement) => boolean
): Readonly<[ReadonlyArray<Departement>, ReadonlyArray<Departement>]> {
  return [departements.filter(predicat), departements.filter((departement) => !predicat(departement))]
}
