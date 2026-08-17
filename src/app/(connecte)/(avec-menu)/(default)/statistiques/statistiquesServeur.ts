import { statistiquesCoopToMediateursData } from '@/components/coop/Statistiques/statistiquesCoopToMediateursData'
import type { StatistiquesMediateursData } from '@/components/coop/Statistiques/types'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { PrismaLieuxCoopLoader } from '@/gateways/PrismaLieuxCoopLoader'
import { clamperPeriode } from '@/shared/dispositif'
import type { StatistiquesFilters } from '@/use-cases/queries/RecupererStatistiquesCoop'
import { StatistiquesPageFilters } from '@/use-cases/queries/RecupererStatistiquesPage'
import { ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export function construireFiltres(
  params: StatistiquesSearchParams,
  scopeFiltre: ScopeFiltre,
  aujourdhui: string
): Readonly<{ au: string; du: string }> & StatistiquesPageFilters {
  const { au: dateFin, du: dateDebut } = clamperPeriode(params.du, params.au, aujourdhui)

  const communesActives = params.communes?.split(',').filter(Boolean) ?? []
  const departementsActifs = params.departements?.split(',').filter(Boolean) ?? []
  const lieuxActifs = params.lieux?.split(',').filter(Boolean) ?? []
  const structuresEmployeusesActives = params.structuresEmployeuses?.split(',').filter(Boolean) ?? []
  const typesActifs = params.types?.split(',').filter(Boolean) ?? []
  const thematiqueNonAdminActifs = params.thematiqueNonAdministratives?.split(',').filter(Boolean) ?? []
  const thematiqueAdminActifs = params.thematiqueAdministratives?.split(',').filter(Boolean) ?? []

  // Les filtres sont exprimés en termes SGN : pas de coop_id ici.
  return {
    au: dateFin,
    communes: communesActives.length > 0 ? communesActives : undefined,
    departements: departementsActifs.length > 0 ? departementsActifs : undefined,
    du: dateDebut,
    lieux: lieuxActifs.length > 0 ? lieuxActifs : undefined,
    scopeFiltre,
    structuresEmployeuses: structuresEmployeusesActives.length > 0 ? structuresEmployeusesActives : undefined,
    thematiqueAdministratives: thematiqueAdminActifs.length > 0 ? thematiqueAdminActifs : undefined,
    thematiqueNonAdministratives: thematiqueNonAdminActifs.length > 0 ? thematiqueNonAdminActifs : undefined,
    types: typesActifs.length > 0 ? (typesActifs as ReadonlyArray<'Collectif' | 'Demarche' | 'Individuel'>) : undefined,
  }
}

export async function recupererStatistiques(
  filtres: StatistiquesPageFilters
): Promise<ErrorViewModel | StatistiquesMediateursData> {
  try {
    // Traduire les IDs SGN en coop_ids (UUIDs attendus par l'API Coop)
    const lieuxCoopIds = filtres.lieux ? await new PrismaLieuxCoopLoader().recupererCoopIds(filtres.lieux) : []

    // Scope implicite → filtres Coop
    let departementsDuScope: ReadonlyArray<string> | undefined
    if (filtres.scopeFiltre.type === 'departemental' && !filtres.departements) {
      departementsDuScope = [...filtres.scopeFiltre.codes]
    }

    // Filtre à la maille activité (structure_employeuse_main_id), pas médiateur : un médiateur ayant eu
    // plusieurs employeurs ne doit compter que pour les activités réalisées pour celle-ci.
    const structuresEmployeusesFiltre =
      filtres.structuresEmployeuses ??
      (filtres.scopeFiltre.type === 'structure' ? [String(filtres.scopeFiltre.id)] : undefined)

    const coopFiltres: StatistiquesFilters = {
      au: filtres.au,
      communes: filtres.communes,
      departements: filtres.departements ?? departementsDuScope,
      du: filtres.du,
      lieux: lieuxCoopIds.length > 0 ? lieuxCoopIds : undefined,
      structuresEmployeuses: structuresEmployeusesFiltre,
      thematiqueAdministratives: filtres.thematiqueAdministratives,
      thematiqueNonAdministratives: filtres.thematiqueNonAdministratives,
      types: filtres.types,
    }

    const readModel = await createApiCoopStatistiquesLoader(false).recupererStatistiques(coopFiltres)
    const vueTerritorialisee =
      (coopFiltres.departements?.length ?? 0) > 0 ||
      (coopFiltres.communes?.length ?? 0) > 0 ||
      (coopFiltres.lieux?.length ?? 0) > 0 ||
      (coopFiltres.structuresEmployeuses?.length ?? 0) > 0
    return statistiquesCoopToMediateursData(readModel, vueTerritorialisee)
  } catch {
    return {
      message: 'Erreur de récupération des données',
      type: 'error',
    }
  }
}

export type StatistiquesSearchParams = Readonly<{
  au?: string
  communes?: string
  departements?: string
  du?: string
  lieux?: string
  structuresEmployeuses?: string
  thematiqueAdministratives?: string
  thematiqueNonAdministratives?: string
  types?: string
}>
