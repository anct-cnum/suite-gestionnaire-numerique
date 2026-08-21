import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import { filtreDuTerritoire, recupererTerritoireVitrine, TerritoireVitrine } from '../../../../territoire'
import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import EtatDesLieux from '@/components/TableauDeBord/EtatDesLieux/EtatDesLieux'
import CarteIndicesFragilite from '@/components/vitrine/SyntheseEtIndicateurs/CarteIndicesFragilite'
import SectionCartographie from '@/components/vitrine/SyntheseEtIndicateurs/SectionCartographie'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import {
  indiceFragiliteDepartementsPresenter,
  indiceFragilitePresenter,
} from '@/presenters/tableauDeBord/indicesPresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'
import { fetchAccompagnementsRealises } from '@/use-cases/queries/fetchAccompagnementsRealises'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const territoire = await recupererTerritoireVitrine(niveau, code?.[0])

  return generateTerritoireMetadata(
    niveau,
    code?.[0],
    {
      descriptionTemplate:
        "Synthèse et indicateurs de l'inclusion numérique pour {territoire}. Lieux d'accompagnement, médiateurs numériques, accompagnements réalisés et indices de fragilité numérique.",
      keywords: [
        'synthèse',
        'indicateurs',
        'inclusion numérique',
        'fragilité numérique',
        'accompagnements',
        'statistiques territoriales',
      ],
      titleTemplate: 'Synthèse et indicateurs - {territoire} - Inclusion Numérique',
    },
    territoire !== null && (territoire.type === 'region' || territoire.type === 'epci') ? territoire.nom : undefined
  )
}

export default async function SyntheseEtIndicateurs({ params }: Props): Promise<ReactElement> {
  const { code, niveau } = await params

  const territoire = await recupererTerritoireVitrine(niveau, code?.[0])
  if (territoire === null) {
    notFound()
  }
  const filtre = filtreDuTerritoire(territoire)

  // Instancier les loaders
  const lieuxLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const mediateursLoader = new PrismaMediateursEtAidantsLoader()
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()

  // Créer la Promise pour les accompagnements (sera résolue de manière asynchrone via Suspense)
  const accompagnementsRealisesPromise = fetchAccompagnementsRealises(filtre)

  // Récupérer les données communes (lieux et médiateurs)
  const [lieuxReadModel, mediateursReadModel] = await Promise.all([
    lieuxLoader.get(filtre),
    mediateursLoader.get(filtre),
  ])

  // Transformer en ViewModels
  const lieuxViewModel = handleReadModelOrError(lieuxReadModel, lieuxInclusionNumeriquePresenter)
  const mediateursViewModel = handleReadModelOrError(mediateursReadModel, mediateursEtAidantsPresenter)

  // Charger et transformer les indices de fragilité selon le niveau
  let indicesFragilite
  if (territoire.type === 'national') {
    const indicesReadModel = await indicesLoader.getForFrance()
    indicesFragilite = isErrorReadModel(indicesReadModel)
      ? { message: indicesReadModel.message, type: 'error' as const }
      : indiceFragiliteDepartementsPresenter(indicesReadModel.departements)
  } else if (territoire.type === 'region') {
    const indicesReadModel = await indicesLoader.getForDepartements(territoire.codesDepartement)
    indicesFragilite = handleReadModelOrError(indicesReadModel, indiceFragiliteDepartementsPresenter)
  } else {
    const indicesReadModel = await chargerLesIndicesCommunaux(indicesLoader, territoire)
    indicesFragilite = handleReadModelOrError(indicesReadModel, indiceFragilitePresenter)
  }

  return (
    <div className="fr-pr-lg-10w" style={{ display: 'flex', flexDirection: 'column' }}>
      <EtatDesLieux
        accompagnementsRealisesPromise={accompagnementsRealisesPromise}
        afficherLienLieux={false}
        carte={<CarteIndicesFragilite indicesFragilite={indicesFragilite} territoire={territoireCarte(territoire)} />}
        lieuxInclusionViewModel={lieuxViewModel}
        mediateursEtAidantsViewModel={mediateursViewModel}
      />
      <div className="fr-mb-4w ">
        <SectionCartographie />
      </div>
      <div className="fr-mb-4w ">
        <SectionSources />
      </div>
    </div>
  )
}

async function chargerLesIndicesCommunaux(
  indicesLoader: PrismaIndicesDeFragiliteLoader,
  territoire: Exclude<TerritoireVitrine, Readonly<{ type: 'national' }> | Readonly<{ type: 'region' }>>
): ReturnType<PrismaIndicesDeFragiliteLoader['getForDepartement']> {
  switch (territoire.type) {
    case 'departement':
      return indicesLoader.getForDepartement(territoire.code)
    case 'epci':
      return indicesLoader.getForCommunes(territoire.codesInsee)
  }
}

function territoireCarte(territoire: TerritoireVitrine): Parameters<typeof CarteIndicesFragilite>[0]['territoire'] {
  switch (territoire.type) {
    case 'departement':
      return { code: territoire.code, type: 'departement' }
    case 'epci':
      return { bbox: territoire.bbox, code: territoire.code, codesInsee: territoire.codesInsee, type: 'epci' }
    case 'national':
      return 'national'
    case 'region':
      return { bbox: territoire.bbox, codesDepartement: territoire.codesDepartement, type: 'region' }
  }
}

type Props = Readonly<{
  params: Promise<{
    code?: ReadonlyArray<string>
    niveau: string
  }>
}>
