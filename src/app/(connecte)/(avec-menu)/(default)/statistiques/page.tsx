import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import FilterTags from './FilterTags'
import FiltreRecherche, { FiltreOption } from './FiltreRecherche'
import { THEMATIQUE_ADMIN_OPTIONS, THEMATIQUE_NON_ADMIN_OPTIONS, TYPES_OPTIONS } from './filtresOptions'
import { construireLibellesFiltres } from './libellesFiltres'
import PlusDesFiltres from './PlusDesFiltres'
import StatistiquesPageContent from './StatistiquesPageContent'
import { construireFiltres, recupererStatistiques, StatistiquesSearchParams } from './statistiquesServeur'
import departementsJson from '../../../../../../ressources/departements.json'
import AsyncLoaderErrorBoundary from '@/components/AidantsMediateurs/GenericErrorBoundary'
import '@/components/coop/Statistiques/statistiques.css'
import ExportStatistiques from '@/components/coop/Statistiques/_components/ExportStatistiques'
import SelecteurRangeDates from '@/components/coop/Statistiques/SelecteurRangeDates'
import SpinnerSimple from '@/components/shared/Spinner/SpinnerSimple'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSession, getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaCommunesCoopLoader } from '@/gateways/PrismaCommunesCoopLoader'
import { PrismaLieuxCoopLoader } from '@/gateways/PrismaLieuxCoopLoader'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaStructuresEmployeusesCoopLoader } from '@/gateways/PrismaStructuresEmployeusesCoopLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { resoudreContexte, ScopeFiltre } from '@/use-cases/queries/ResoudreContexte'

export const metadata: Metadata = {
  title: 'Statistiques médiation numérique',
}

export default async function StatistiquesController({ searchParams }: Props): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateur = await new PrismaUtilisateurLoader().findById(await getSessionUtilisateurId())
  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const scopeFiltre: ScopeFiltre =
    contexte.role === 'gestionnaire_structure'
      ? { id: contexte.idStructure(), type: 'structure' }
      : contexte.scopeFiltre()

  const params = await searchParams
  const aujourdhui = new Date().toISOString().slice(0, 10)
  const filtres = construireFiltres(params, scopeFiltre, aujourdhui)
  const { au: dateFin, du: dateDebut } = filtres

  const communesActives = filtres.communes ?? []
  const lieuxActifs = filtres.lieux ?? []
  const structuresEmployeusesActives = filtres.structuresEmployeuses ?? []
  const typesActifs = filtres.types ?? []
  const thematiqueNonAdminActifs = filtres.thematiqueNonAdministratives ?? []
  const thematiqueAdminActifs = filtres.thematiqueAdministratives ?? []

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
  const departementsSelectionnes = departementsOptions.filter((opt) => (filtres.departements ?? []).includes(opt.value))
  const nomStructure = structureDuScope.at(0)?.label
  const titre = nomStructure === undefined ? 'Statistiques médiation numérique' : `Statistiques de ${nomStructure}`

  const libellesFiltres = construireLibellesFiltres({
    aujourdhui,
    communesSelectionnees,
    dateDebut,
    dateFin,
    departementsSelectionnes,
    lieuxSelectionnes,
    structuresEmployeusesSelectionnees,
    thematiqueAdministratives: thematiqueAdminActifs,
    thematiqueNonAdministratives: thematiqueNonAdminActifs,
    types: typesActifs,
  })

  return (
    <>
      <div className="fr-no-print">
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
          <ExportStatistiques filtres={libellesFiltres} />
        </div>

        <h1 className="fr-h2 color-blue-france fr-mb-4v">{titre}</h1>

        <FilterTags
          communesSelectionnees={communesSelectionnees}
          dateDebut={dateDebut}
          dateFin={dateFin}
          departementsOptions={departementsOptions}
          lieuxSelectionnes={lieuxSelectionnes}
          structuresEmployeusesSelectionnees={structuresEmployeusesSelectionnees}
          thematiqueAdminOptions={THEMATIQUE_ADMIN_OPTIONS}
          thematiqueNonAdminOptions={THEMATIQUE_NON_ADMIN_OPTIONS}
          typesOptions={TYPES_OPTIONS}
        />
      </div>

      <AsyncLoaderErrorBoundary
        fallback={
          <div className="fr-py-4w">
            <div className="fr-alert fr-alert--error">
              <p>Erreur de récupération des données</p>
            </div>
          </div>
        }
      >
        <Suspense
          fallback={<SpinnerSimple text="Récupération des statistiques..." />}
          key={`${dateDebut}-${dateFin}-${params.communes ?? ''}-${params.departements ?? ''}-${params.lieux ?? ''}-${params.structuresEmployeuses ?? ''}-${params.types ?? ''}-${params.thematiqueNonAdministratives ?? ''}-${params.thematiqueAdministratives ?? ''}`}
        >
          <StatistiquesPageContent
            libellesFiltres={libellesFiltres}
            statistiquesPromise={statistiquesPromise}
            titre={titre}
          />
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

type Props = Readonly<{
  searchParams: Promise<StatistiquesSearchParams>
}>
