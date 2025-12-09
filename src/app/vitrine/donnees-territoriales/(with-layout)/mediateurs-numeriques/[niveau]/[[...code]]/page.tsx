import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import AsyncLoaderErrorBoundary from '@/components/AidantsMediateurs/GenericErrorBoundary'
import { StatistiquesAsyncContent, statistiquesCoopToMediateursData, StatistiquesMediateursData } from '@/components/coop/Statistiques'
import SpinnerSimple from '@/components/shared/Spinner/SpinnerSimple'
import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import CarteStatistiqueAidantsConnect from '@/components/vitrine/MediateursNumeriques/CarteStatistiqueAidantsConnect'
import CarteStatistiqueConseillersNumeriques from '@/components/vitrine/MediateursNumeriques/CarteStatistiqueConseillersNumeriques'
import CarteStatistiqueMediateurs from '@/components/vitrine/MediateursNumeriques/CarteStatistiqueMediateurs'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { PrismaStatistiquesMediateursLoader } from '@/gateways/PrismaStatistiquesMediateursLoader'
import { statistiquesMediateursPresenter, StatistiquesMediateursViewModel } from '@/presenters/vitrine/statistiquesMediateursPresenter'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'

const DATE_DEBUT_DISPOSITIF = '2020-11-07'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const codeDepartement = code?.[0]

  return generateTerritoireMetadata(niveau, codeDepartement, {
    descriptionTemplate: 'Découvrez les médiateurs numériques pour {territoire}. Statistiques sur les conseillers numériques, aidants Connect et professionnels de la médiation numérique.',
    keywords: ['médiateurs numériques', 'conseillers numériques', 'Aidants Connect', 'médiation numérique', 'accompagnement numérique'],
    titleTemplate: 'Médiateurs numériques - {territoire} - Inclusion Numérique',
  })
}

export default async function MediateursNumeriques({ params, searchParams }: Props): Promise<ReactElement> {
  const { code, niveau } = await params
  const { au, du } = await searchParams

  // Validation : niveau doit être 'national' ou 'departement'
  if (niveau !== 'national' && niveau !== 'departement') {
    notFound()
  }

  // Validation : si niveau = 'departement', code est obligatoire
  if (niveau === 'departement' && (code === undefined || code.length === 0)) {
    notFound()
  }

  // Extraction du code département si présent
  const codeDepartement = niveau === 'departement' && code !== undefined ? code[0] : undefined

  // Déterminer le territoire pour les loaders
  const territoire = niveau === 'national' ? 'France' : codeDepartement ?? ''

  // Dates pour le filtre (par défaut : début du dispositif jusqu'à aujourd'hui)
  const aujourdhui = new Date().toISOString().slice(0, 10)
  const dateDebut = du ?? DATE_DEBUT_DISPOSITIF
  const dateFin = au ?? aujourdhui

  // Récupérer les statistiques synchrones des médiateurs
  const statistiquesMediateursLoader = new PrismaStatistiquesMediateursLoader()
  const statistiquesMediateursReadModel = await statistiquesMediateursLoader.get(territoire)
  const statistiquesMediateursViewModel = handleReadModelOrError(
    statistiquesMediateursReadModel,
    statistiquesMediateursPresenter
  )

  // Créer la promesse de récupération des statistiques async (Coop)
  const statistiquesPromise = recupererStatistiques(codeDepartement, dateDebut, dateFin)

  return (
    <div
      className="fr-pr-md-10w"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <div className="fr-mb-4w">
        <h1 className="fr-h3 color-blue-france fr-mb-1w">
          Médiateurs numériques
        </h1>
        <div>
          <p className="fr-m-0 font-weight-500">
            L&apos;ensemble des personnes dont le rôle est de faire de la médiation numérique
          </p>
        </div>
      </div>
      {renderCartesStatistiques(statistiquesMediateursViewModel)}
      <AsyncLoaderErrorBoundary
        fallback={
          <div className="fr-py-4w">
            <div className="fr-alert fr-alert--error">
              <p>
                Erreur de récupération de la donnée depuis la Coop
              </p>
            </div>
          </div>
        }
      >
        <Suspense
          fallback={<SpinnerSimple text="Récupération des données depuis la Coop" />}
          key={`${dateDebut}-${dateFin}`}
        >
          <StatistiquesAsyncContent
            dateDebut={dateDebut}
            dateFin={dateFin}
            statistiquesPromise={statistiquesPromise}
          />
        </Suspense>
      </AsyncLoaderErrorBoundary>
      <div className="fr-mb-4w ">
        <SectionSources />
      </div>
    </div>
  )
}

function renderCartesStatistiques(
  viewModel: ErrorViewModel | StatistiquesMediateursViewModel
): ReactElement {
  if (isErrorReadModel(viewModel)) {
    return (
      <div className="fr-mb-4w">
        <div className="fr-alert fr-alert--error">
          <p>
            {viewModel.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-4w">
      <div className="fr-col-12 fr-col-sm-6 fr-col-lg-4">
        <CarteStatistiqueMediateurs
          nombre={viewModel.mediateurs.nombre}
          sousTexte={viewModel.mediateurs.sousTexte}
        />
      </div>
      <div className="fr-col-12 fr-col-sm-6 fr-col-lg-4">
        <CarteStatistiqueConseillersNumeriques
          nombre={viewModel.conseillersNumeriques.nombre}
          sousTexte={viewModel.conseillersNumeriques.sousTexte}
        />
      </div>
      <div className="fr-col-12 fr-col-sm-6 fr-col-lg-4">
        <CarteStatistiqueAidantsConnect
          nombre={viewModel.aidantsConnect.nombre}
          sousTexte={viewModel.aidantsConnect.sousTexte}
        />
      </div>
    </div>
  )
}

async function recupererStatistiques(
  codeDepartement?: string,
  dateDebut?: string,
  dateFin?: string
): Promise<ErrorViewModel | StatistiquesMediateursData> {
  try {
    const loader = createApiCoopStatistiquesLoader()
    const filtres: {
      au?: string
      departements?: ReadonlyArray<string>
      du?: string
    } = {}

    if (codeDepartement !== undefined) {
      filtres.departements = [codeDepartement]
    }
    if (dateDebut !== undefined) {
      filtres.du = dateDebut
    }
    if (dateFin !== undefined) {
      filtres.au = dateFin
    }

    const readModel = await loader.recupererStatistiques(Object.keys(filtres).length > 0 ? filtres : undefined)
    return statistiquesCoopToMediateursData(readModel)
  } catch {
    return {
      message: 'Erreur de récupération de la donnée depuis la Coop',
      type: 'error',
    }
  }
}

type Props = Readonly<{
  params: Promise<{
    code?: ReadonlyArray<string>
    niveau: string
  }>
  searchParams: Promise<{
    au?: string
    du?: string
  }>
}>
