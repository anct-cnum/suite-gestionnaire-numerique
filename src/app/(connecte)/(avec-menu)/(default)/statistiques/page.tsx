import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import FilterTags from './FilterTags'
import FiltreRecherche, { FiltreOption } from './FiltreRecherche'
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
    scopeFiltre,
    structuresEmployeuses: structuresEmployeusesActives.length > 0 ? structuresEmployeusesActives : undefined,
    thematiqueAdministratives: thematiqueAdminActifs.length > 0 ? thematiqueAdminActifs : undefined,
    thematiqueNonAdministratives: thematiqueNonAdminActifs.length > 0 ? thematiqueNonAdminActifs : undefined,
    types: typesActifs.length > 0 ? (typesActifs as ReadonlyArray<'Collectif' | 'Demarche' | 'Individuel'>) : undefined,
  }

  // Démarrer les stats immédiatement (Suspense les affichera quand prêt)
  const statistiquesPromise = recupererStatistiques(filtres)

  // Charger uniquement les labels des items sélectionnés (fast : 0-5 rows par PK)
  const [lieuxSelectionnes, communesSelectionnees, structuresEmployeusesSelectionnees, structureDuScope] =
    await Promise.all([
      lieuxActifs.length > 0 ? new PrismaLieuxCoopLoader().recupererParIds(lieuxActifs) : Promise.resolve([]),
      communesActives.length > 0
        ? new PrismaCommunesCoopLoader().recupererParCodes(communesActives)
        : Promise.resolve([]),
      structuresEmployeusesActives.length > 0
        ? new PrismaStructuresEmployeusesCoopLoader().recupererParIds(structuresEmployeusesActives)
        : Promise.resolve([]),
      scopeFiltre.type === 'structure'
        ? new PrismaStructuresEmployeusesCoopLoader().recupererParIds([String(scopeFiltre.id)])
        : Promise.resolve([]),
    ])
  const departementsOptions = departementsParScope(scopeFiltre)
  const departementsSelectionnes = departementsOptions.filter((opt) =>
    (departementsParam?.split(',').filter(Boolean) ?? []).includes(opt.value)
  )
  const nomStructure = structureDuScope.at(0)?.label

  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Statistiques' }]} />

      <div className="fr-flex fr-align-items-center fr-flex-gap-2v fr-mb-4v fr-flex-wrap">
        <div className="fr-flex fr-align-items-center fr-flex-gap-2v fr-flex-grow-1 fr-flex-wrap">
          <SelecteurRangeDates dateDebut={dateDebut} dateFin={dateFin} />
          <FiltreRecherche
            libelle="Département"
            libelleBouton="Départements"
            libellePluriel="départements sélectionnés"
            libelleSingulier="département sélectionné"
            options={departementsOptions}
            param="departements"
            placeholder="Chercher un département"
            selection={departementsSelectionnes}
          />
          <FiltreRecherche
            libelle="Commune"
            libelleBouton="Communes"
            libellePluriel="communes sélectionnées"
            libelleSingulier="commune sélectionnée"
            param="communes"
            placeholder="Chercher une commune"
            selection={communesSelectionnees}
            urlRecherche="/api/statistiques/communes"
          />
          <FiltreRecherche
            libelle="Structure"
            libelleBouton="Structures employeuses"
            libellePluriel="structures sélectionnées"
            libelleSingulier="structure sélectionnée"
            param="structuresEmployeuses"
            placeholder="Chercher une structure employeuse"
            selection={structuresEmployeusesSelectionnees}
            urlRecherche="/api/statistiques/structures-employeuses"
          />
          <FiltreRecherche
            libelle="Lieu"
            libelleBouton="Lieux"
            libellePluriel="lieux sélectionnés"
            libelleSingulier="lieu sélectionné"
            param="lieux"
            placeholder="Chercher un lieu d'inclusion"
            selection={lieuxSelectionnes}
            urlRecherche="/api/statistiques/lieux"
          />
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

      <h1 className="fr-h2 color-blue-france fr-mb-4v">
        {nomStructure === undefined ? 'Statistiques médiation numérique' : `Statistiques de ${nomStructure}`}
      </h1>

      <FilterTags
        communesSelectionnees={communesSelectionnees}
        departementsOptions={departementsOptions}
        lieuxSelectionnes={lieuxSelectionnes}
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
          key={`${dateDebut}-${dateFin}-${communesParam ?? ''}-${departementsParam ?? ''}-${lieuxParam ?? ''}-${structuresEmployeusesParam ?? ''}-${typesParam ?? ''}-${thematiqueNonAdminParam ?? ''}-${thematiqueAdminParam ?? ''}`}
        >
          <StatistiquesPageContent statistiquesPromise={statistiquesPromise} />
        </Suspense>
      </AsyncLoaderErrorBoundary>
    </>
  )
}

function departementsParScope(scopeFiltre: ScopeFiltre): ReadonlyArray<FiltreOption> {
  const tous = [...departementsJson]
    .sort((depA, depB) => depA.code.localeCompare(depB.code, 'fr'))
    .map((dep) => ({ label: `${dep.nom} - ${dep.code}`, value: dep.code }))

  if (scopeFiltre.type === 'national') {
    return tous
  }

  if (scopeFiltre.type === 'departemental') {
    const codesSet = new Set(scopeFiltre.codes)
    return tous.filter((dep) => codesSet.has(dep.value))
  }

  return []
}

async function recupererStatistiques(
  filtres: StatistiquesPageFilters
): Promise<ErrorViewModel | StatistiquesMediateursData> {
  try {
    // Traduire les IDs SGN en coop_ids (UUIDs attendus par l'API Coop)
    const [lieuxCoopIds, structuresCoopIds] = await Promise.all([
      filtres.lieux ? new PrismaLieuxCoopLoader().recupererCoopIds(filtres.lieux) : Promise.resolve([]),
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
    if (filtres.scopeFiltre.type === 'structure' && filtres.structuresEmployeuses === undefined) {
      mediateursCoopIdsScope = await new PrismaMediateursCoopLoader().recupererCoopIdsParStructure(
        filtres.scopeFiltre.id
      )
    }

    // Résolution des médiateurs : structures employeuses explicites, sinon scope implicite
    const mediateursFiltres = structuresCoopIds.length > 0 ? structuresCoopIds : mediateursCoopIdsScope

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

type Props = Readonly<{
  searchParams: Promise<{
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
}>
