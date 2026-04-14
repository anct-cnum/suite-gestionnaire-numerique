import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import FilterTags from './FilterTags'
import FiltreCommune from './FiltreCommune'
import FiltreDepartement from './FiltreDepartement'
import type { DepartementOption } from './FiltreDepartement'
import FiltreLieux from './FiltreLieux'
import FiltreMediateursStats from './FiltreMediateursStats'
import FiltreStructuresEmployeuses from './FiltreStructuresEmployeuses'
import PlusDesFiltres, { THEMATIQUE_ADMIN_OPTIONS, THEMATIQUE_NON_ADMIN_OPTIONS, TYPES_OPTIONS } from './PlusDesFiltres'
import StatistiquesPageContent from './StatistiquesPageContent'
import departementsJson from '../../../../../../ressources/departements.json'
import AsyncLoaderErrorBoundary from '@/components/AidantsMediateurs/GenericErrorBoundary'
import '@/components/coop/Statistiques/statistiques.css'
import SelecteurRangeDates from '@/components/coop/Statistiques/SelecteurRangeDates'
import { statistiquesCoopToMediateursData } from '@/components/coop/Statistiques/statistiquesCoopToMediateursData'
import type { StatistiquesMediateursData } from '@/components/coop/Statistiques/types'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import SpinnerSimple from '@/components/shared/Spinner/SpinnerSimple'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { ApiCoopStatistiquesLoader } from '@/gateways/apiCoop/ApiCoopStatistiquesLoader'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaCommunesCoopLoader } from '@/gateways/PrismaCommunesCoopLoader'
import { PrismaLieuxCoopLoader } from '@/gateways/PrismaLieuxCoopLoader'
import { PrismaMediateursCoopLoader } from '@/gateways/PrismaMediateursCoopLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructuresEmployeusesCoopLoader } from '@/gateways/PrismaStructuresEmployeusesCoopLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import type { StatistiquesFilters } from '@/use-cases/queries/RecupererStatistiquesCoop'
import { StatistiquesPageFilters } from '@/use-cases/queries/RecupererStatistiquesPage'
import { resoudreContexte, ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

const DATE_DEBUT_DISPOSITIF = '2020-11-07'

export const metadata: Metadata = {
  title: 'Statistiques médiation numérique',
}

export default async function StatistiquesController({ searchParams }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findByUid(await getSessionSub())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const scopeFiltre: ScopeFiltre =
    contexte.role === 'gestionnaire_structure'
      ? { id: contexte.idStructure(), type: 'structure' }
      : contexte.scopeFiltre()

  const {
    au,
    communes: communesParam,
    departements: departementsParam,
    du,
    lieux: lieuxParam,
    mediateurs: mediateursParam,
    structuresEmployeuses: structuresEmployeusesParam,
    thematiqueAdministratives: thematiqueAdminParam,
    thematiqueNonAdministratives: thematiqueNonAdminParam,
    types: typesParam,
  } = await searchParams
  const aujourdhui = new Date().toISOString().slice(0, 10)
  const dateDebut = du ?? DATE_DEBUT_DISPOSITIF
  const dateFin = au ?? aujourdhui

  const communesActives = communesParam?.split(',').filter(Boolean) ?? []
  const lieuxActifs = lieuxParam?.split(',').filter(Boolean) ?? []
  const mediateursActifs = mediateursParam?.split(',').filter(Boolean) ?? []
  const structuresEmployeusesActives = structuresEmployeusesParam?.split(',').filter(Boolean) ?? []
  const typesActifs = typesParam?.split(',').filter(Boolean) ?? []
  const thematiqueNonAdminActifs = thematiqueNonAdminParam?.split(',').filter(Boolean) ?? []
  const thematiqueAdminActifs = thematiqueAdminParam?.split(',').filter(Boolean) ?? []

  // Les filtres sont exprimés en termes SGN : pas de coop_id ici.
  const filtres: StatistiquesPageFilters = {
    au: dateFin,
    communes: communesActives.length > 0 ? communesActives : undefined,
    departements: departementsParam ? departementsParam.split(',').filter(Boolean) : undefined,
    du: dateDebut,
    lieux: lieuxActifs.length > 0 ? lieuxActifs : undefined,
    mediateurs: mediateursActifs.length > 0 ? mediateursActifs.map(Number).filter(Boolean) : undefined,
    scopeFiltre,
    structuresEmployeuses: structuresEmployeusesActives.length > 0 ? structuresEmployeusesActives : undefined,
    thematiqueAdministratives: thematiqueAdminActifs.length > 0 ? thematiqueAdminActifs : undefined,
    thematiqueNonAdministratives: thematiqueNonAdminActifs.length > 0 ? thematiqueNonAdminActifs : undefined,
    types: typesActifs.length > 0 ? (typesActifs as ReadonlyArray<'Collectif' | 'Demarche' | 'Individuel'>) : undefined,
  }

  // Démarrer les stats immédiatement (Suspense les affichera quand prêt)
  const statistiquesPromise = recupererStatistiques(filtres)

  // Charger uniquement les labels des items sélectionnés (fast : 0-5 rows par PK)
  const [lieuxSelectionnes, mediateursSelectionnes, communesSelectionnees, structuresEmployeusesSelectionnees] =
    await Promise.all([
      lieuxActifs.length > 0 ? new PrismaLieuxCoopLoader().recupererParIds(lieuxActifs) : Promise.resolve([]),
      mediateursActifs.length > 0
        ? new PrismaMediateursCoopLoader().recupererParIds(mediateursActifs.map(Number).filter(Boolean))
        : Promise.resolve([]),
      communesActives.length > 0
        ? new PrismaCommunesCoopLoader().recupererParCodes(communesActives)
        : Promise.resolve([]),
      structuresEmployeusesActives.length > 0
        ? new PrismaStructuresEmployeusesCoopLoader().recupererParIds(structuresEmployeusesActives)
        : Promise.resolve([]),
    ])
  const departementsOptions = departementsParScope(scopeFiltre)

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Statistiques' }]} />

      <div className="fr-flex fr-align-items-center fr-flex-gap-2v fr-mb-4v fr-flex-wrap">
        <div className="fr-flex fr-align-items-center fr-flex-gap-2v fr-flex-grow-1 fr-flex-wrap">
          <SelecteurRangeDates dateDebut={dateDebut} dateFin={dateFin} />
          <FiltreDepartement
            departements={departementsParam?.split(',').filter(Boolean) ?? []}
            options={departementsOptions}
          />
          <FiltreCommune communes={communesActives} communesSelectionnees={communesSelectionnees} />
          <FiltreStructuresEmployeuses
            structures={structuresEmployeusesActives}
            structuresSelectionnees={structuresEmployeusesSelectionnees}
          />
          <FiltreLieux lieux={lieuxActifs} lieuxSelectionnes={lieuxSelectionnes} />
          <FiltreMediateursStats mediateurs={mediateursActifs} mediateursSelectionnes={mediateursSelectionnes} />
          <PlusDesFiltres
            thematiqueAdministratives={thematiqueAdminActifs}
            thematiqueNonAdministratives={thematiqueNonAdminActifs}
            types={typesActifs}
          />
        </div>
        <button className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-download-line" type="button">
          Exporter
        </button>
      </div>

      <h1 className="fr-h2 color-blue-france fr-mb-4v">Statistiques médiation numérique</h1>

      <div className="fr-background-alt--blue-france fr-border-radius--8 fr-flex fr-align-items-center fr-flex-gap-4v fr-py-4v fr-px-6v fr-mb-6v">
        <svg aria-hidden fill="none" height="24" viewBox="0 0 19 19" width="24" xmlns="http://www.w3.org/2000/svg">
          <path
            clipRule="evenodd"
            d="M17 0H2C0.895431 0 0 0.895431 0 2V17C0 18.1046 0.895431 19 2 19H17C18.1046 19 19 18.1046 19 17V2C19 0.895431 18.1046 0 17 0ZM10.5 4.5H8.5V6.5H10.5V4.5ZM10.5 8.5H8.5V14.5H10.5V8.5Z"
            fill="var(--background-flat-info, #0063CB)"
            fillRule="evenodd"
          />
        </svg>
        <p className="fr-text--xs fr-mb-0">
          Les activités renseignées dans l&apos;Espace Coop (V1) sont maintenant visibles sur cette page statistique.{' '}
          {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
          <a className="fr-link" href="#">
            En savoir plus
          </a>
        </p>
      </div>

      <FilterTags
        communesSelectionnees={communesSelectionnees}
        departementsOptions={departementsOptions}
        lieuxSelectionnes={lieuxSelectionnes}
        mediateursSelectionnes={mediateursSelectionnes}
        structuresEmployeusesSelectionnees={structuresEmployeusesSelectionnees}
        thematiqueAdminOptions={THEMATIQUE_ADMIN_OPTIONS}
        thematiqueNonAdminOptions={THEMATIQUE_NON_ADMIN_OPTIONS}
        typesOptions={TYPES_OPTIONS}
      />

      <AsyncLoaderErrorBoundary
        fallback={
          <div className="fr-py-4w">
            <div className="fr-alert fr-alert--error">
              <p>Erreur de récupération des données depuis la Coop</p>
            </div>
          </div>
        }
      >
        <Suspense
          fallback={<SpinnerSimple text="Récupération des statistiques..." />}
          key={`${dateDebut}-${dateFin}-${communesParam ?? ''}-${departementsParam ?? ''}-${lieuxParam ?? ''}-${mediateursParam ?? ''}-${structuresEmployeusesParam ?? ''}-${typesParam ?? ''}-${thematiqueNonAdminParam ?? ''}-${thematiqueAdminParam ?? ''}`}
        >
          <StatistiquesPageContent statistiquesPromise={statistiquesPromise} />
        </Suspense>
      </AsyncLoaderErrorBoundary>
    </>
  )
}

function departementsParScope(scopeFiltre: ScopeFiltre): ReadonlyArray<DepartementOption> {
  const tous = [...departementsJson].sort((depA, depB) => depA.nom.localeCompare(depB.nom, 'fr'))

  if (scopeFiltre.type === 'national') {
    return tous
  }

  if (scopeFiltre.type === 'departemental') {
    const codesSet = new Set(scopeFiltre.codes)
    return tous.filter((dep) => codesSet.has(dep.code))
  }

  return []
}

async function recupererStatistiques(
  filtres: StatistiquesPageFilters
): Promise<ErrorViewModel | StatistiquesMediateursData> {
  try {
    // Traduire les IDs SGN en coop_ids (UUIDs attendus par l'API Coop)
    const [lieuxCoopIds, mediateursCoopIds, structuresCoopIds] = await Promise.all([
      filtres.lieux ? new PrismaLieuxCoopLoader().recupererCoopIds(filtres.lieux) : Promise.resolve([]),
      filtres.mediateurs ? new PrismaMediateursCoopLoader().recupererCoopIds(filtres.mediateurs) : Promise.resolve([]),
      filtres.structuresEmployeuses
        ? new PrismaMediateursCoopLoader().recupererCoopIdsParStructures(filtres.structuresEmployeuses)
        : Promise.resolve([]),
    ])

    // Scope implicite → filtres Coop
    let departementsDuScope: ReadonlyArray<string> | undefined
    let mediateursCoopIdsScope: ReadonlyArray<string> | undefined
    if (filtres.scopeFiltre.type === 'departemental' && !filtres.departements) {
      departementsDuScope = [...filtres.scopeFiltre.codes]
    }
    if (
      filtres.scopeFiltre.type === 'structure' &&
      filtres.mediateurs === undefined &&
      filtres.structuresEmployeuses === undefined
    ) {
      mediateursCoopIdsScope = await new PrismaMediateursCoopLoader().recupererCoopIdsParStructure(
        filtres.scopeFiltre.id
      )
    }

    const mediateursFiltres = resoudreMediateursFiltres(mediateursCoopIds, structuresCoopIds, mediateursCoopIdsScope)

    const coopFiltres: StatistiquesFilters = {
      au: filtres.au,
      communes: filtres.communes,
      departements: filtres.departements ?? departementsDuScope,
      du: filtres.du,
      lieux: lieuxCoopIds.length > 0 ? lieuxCoopIds : undefined,
      mediateurs: mediateursFiltres && mediateursFiltres.length > 0 ? mediateursFiltres : undefined,
      thematiqueAdministratives: filtres.thematiqueAdministratives,
      thematiqueNonAdministratives: filtres.thematiqueNonAdministratives,
      types: filtres.types,
    }

    const readModel = await new ApiCoopStatistiquesLoader().recupererStatistiques(coopFiltres)
    return statistiquesCoopToMediateursData(readModel)
  } catch {
    return {
      message: 'Erreur de récupération des données',
      type: 'error',
    }
  }
}

// Résolution finale des médiateurs :
// - structures ET médiateurs explicites → intersection
// - structures seules → médiateurs de ces structures
// - médiateurs seuls → médiateurs explicites
// - ni l'un ni l'autre → scope implicite
function resoudreMediateursFiltres(
  mediateursCoopIds: ReadonlyArray<string>,
  structuresCoopIds: ReadonlyArray<string>,
  mediateursCoopIdsScope: ReadonlyArray<string> | undefined
): ReadonlyArray<string> | undefined {
  if (structuresCoopIds.length > 0 && mediateursCoopIds.length > 0) {
    const structuresSet = new Set(structuresCoopIds)
    return mediateursCoopIds.filter((id) => structuresSet.has(id))
  }
  if (structuresCoopIds.length > 0) return structuresCoopIds
  if (mediateursCoopIds.length > 0) return mediateursCoopIds
  return mediateursCoopIdsScope
}

type Props = Readonly<{
  searchParams: Promise<{
    au?: string
    communes?: string
    departements?: string
    du?: string
    lieux?: string
    mediateurs?: string
    structuresEmployeuses?: string
    thematiqueAdministratives?: string
    thematiqueNonAdministratives?: string
    types?: string
  }>
}>
