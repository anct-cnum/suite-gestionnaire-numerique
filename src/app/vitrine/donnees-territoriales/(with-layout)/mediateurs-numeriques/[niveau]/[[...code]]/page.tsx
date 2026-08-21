import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement, Suspense } from 'react'

import { filtreDuTerritoire, recupererTerritoireVitrine } from '../../../../territoire'
import AsyncLoaderErrorBoundary from '@/components/AidantsMediateurs/GenericErrorBoundary'
import {
  StatistiquesAsyncContent,
  statistiquesCoopToMediateursData,
  StatistiquesMediateursData,
} from '@/components/coop/Statistiques'
import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import SpinnerSimple from '@/components/shared/Spinner/SpinnerSimple'
import CarteStatistiqueAidantsConnect from '@/components/vitrine/MediateursNumeriques/CarteStatistiqueAidantsConnect'
import CarteStatistiqueConseillersNumeriques from '@/components/vitrine/MediateursNumeriques/CarteStatistiqueConseillersNumeriques'
import CarteStatistiqueMediateurs from '@/components/vitrine/MediateursNumeriques/CarteStatistiqueMediateurs'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { PrismaStatistiquesMediateursLoader } from '@/gateways/PrismaStatistiquesMediateursLoader'
import {
  statistiquesMediateursPresenter,
  StatistiquesMediateursViewModel,
} from '@/presenters/vitrine/statistiquesMediateursPresenter'
import { clamperPeriode } from '@/shared/dispositif'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'
import { filtresCoop } from '@/use-cases/queries/fetchAccompagnementsRealises'
import { FiltreTerritorial } from '@/use-cases/queries/shared/FiltreTerritorial'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const territoire = await recupererTerritoireVitrine(niveau, code?.[0])

  return generateTerritoireMetadata(
    niveau,
    code?.[0],
    {
      descriptionTemplate:
        'Découvrez les médiateurs numériques pour {territoire}. Statistiques sur les conseillers numériques, aidants Connect et professionnels de la médiation numérique.',
      keywords: [
        'médiateurs numériques',
        'conseillers numériques',
        'Aidants Connect',
        'médiation numérique',
        'accompagnement numérique',
      ],
      titleTemplate: 'Médiateurs numériques - {territoire} - Inclusion Numérique',
    },
    territoire !== null && (territoire.type === 'region' || territoire.type === 'epci') ? territoire.nom : undefined
  )
}

export default async function MediateursNumeriques({ params, searchParams }: Props): Promise<ReactElement> {
  const { code, niveau } = await params
  const { au, du } = await searchParams

  const territoire = await recupererTerritoireVitrine(niveau, code?.[0])
  if (territoire === null) {
    notFound()
  }
  const filtre = filtreDuTerritoire(territoire)

  // Dates pour le filtre (par défaut : début du dispositif jusqu'à aujourd'hui)
  const aujourdhui = new Date().toISOString().slice(0, 10)
  const { au: dateFin, du: dateDebut } = clamperPeriode(du, au, aujourdhui)

  // Récupérer les statistiques synchrones des médiateurs
  const statistiquesMediateursLoader = new PrismaStatistiquesMediateursLoader()
  const statistiquesMediateursReadModel = await statistiquesMediateursLoader.get(filtre)
  const statistiquesMediateursViewModel = handleReadModelOrError(
    statistiquesMediateursReadModel,
    statistiquesMediateursPresenter
  )

  // Créer la promesse de récupération des statistiques async (Coop)
  const statistiquesPromise = recupererStatistiques(filtre, dateDebut, dateFin)

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="fr-mb-4w">
        <h2 className="fr-h2 color-blue-france fr-mb-0">Médiateurs numériques</h2>
        <div>
          <p className="fr-m-0 fr-text--sm fr-text--semi-bold fr-text-mention--grey">
            L&apos;ensemble des personnes dont le rôle est de faire de la médiation numérique
          </p>
        </div>
      </div>
      {renderCartesStatistiques(statistiquesMediateursViewModel)}
      <hr />
      <AsyncLoaderErrorBoundary
        fallback={
          <div className="fr-py-4w">
            <div className="fr-alert fr-alert--error">
              <p>Erreur de récupération de la donnée</p>
            </div>
          </div>
        }
      >
        <Suspense fallback={<SpinnerSimple text="Récupération des données" />} key={`${dateDebut}-${dateFin}`}>
          <StatistiquesAsyncContent dateDebut={dateDebut} dateFin={dateFin} statistiquesPromise={statistiquesPromise} />
        </Suspense>
      </AsyncLoaderErrorBoundary>
      <div className="fr-mb-4w ">
        <SectionSources />
      </div>
    </div>
  )
}

function renderCartesStatistiques(viewModel: ErrorViewModel | StatistiquesMediateursViewModel): ReactElement {
  if (isErrorReadModel(viewModel)) {
    return (
      <div className="fr-mb-4w">
        <div className="fr-alert fr-alert--error">
          <p>{viewModel.message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="fr-grid-row fr-grid-row--gutters fr-mb-3v">
      <div className="fr-col-12 fr-col-sm-6 fr-col-lg-4">
        <CarteStatistiqueMediateurs nombre={viewModel.mediateurs.nombre} sousTexte={viewModel.mediateurs.sousTexte} />
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
  filtre: FiltreTerritorial,
  dateDebut?: string,
  dateFin?: string
): Promise<ErrorViewModel | StatistiquesMediateursData> {
  try {
    const loader = createApiCoopStatistiquesLoader()
    const filtres = {
      ...filtresCoop(filtre),
      ...(dateDebut !== undefined ? { du: dateDebut } : {}),
      ...(dateFin !== undefined ? { au: dateFin } : {}),
    }

    const readModel = await loader.recupererStatistiques(Object.keys(filtres).length > 0 ? filtres : undefined)
    return statistiquesCoopToMediateursData(readModel, filtre.type !== 'national')
  } catch {
    return {
      message: 'Erreur de récupération de la donnée',
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
