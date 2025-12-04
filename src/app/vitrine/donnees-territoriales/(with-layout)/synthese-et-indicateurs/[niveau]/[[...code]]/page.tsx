import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import { handleReadModelOrError, isErrorReadModel } from '@/components/shared/ErrorHandler'
import EtatDesLieux from '@/components/TableauDeBord/EtatDesLieux/EtatDesLieux'
import CarteIndicesFragilite from '@/components/vitrine/SyntheseEtIndicateurs/CarteIndicesFragilite'
import SectionCartographie from '@/components/vitrine/SyntheseEtIndicateurs/SectionCartographie'
import SectionSources from '@/components/vitrine/SyntheseEtIndicateurs/SectionSources'
import { PrismaAccompagnementsRealisesLoader } from '@/gateways/tableauDeBord/PrismaAccompagnementsRealisesLoader'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/tableauDeBord/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/tableauDeBord/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/tableauDeBord/PrismaMediateursEtAidantsLoader'
import { accompagnementsRealisesPresenter } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { indiceFragiliteDepartementsPresenter, indiceFragilitePresenter } from '@/presenters/tableauDeBord/indicesPresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const codeDepartement = code?.[0]

  return generateTerritoireMetadata(niveau, codeDepartement, {
    descriptionTemplate: 'Synthèse et indicateurs de l\'inclusion numérique pour {territoire}. Lieux d\'accompagnement, médiateurs numériques, accompagnements réalisés et indices de fragilité numérique.',
    keywords: ['synthèse', 'indicateurs', 'inclusion numérique', 'fragilité numérique', 'accompagnements', 'statistiques territoriales'],
    titleTemplate: 'Synthèse et indicateurs - {territoire} - Inclusion Numérique',
  })
}

export default async function SyntheseEtIndicateurs({ params }: Props): Promise<ReactElement> {
  const { code, niveau } = await params

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

  // Instancier les loaders
  const lieuxLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const mediateursLoader = new PrismaMediateursEtAidantsLoader()
  const accompagnementsLoader = new PrismaAccompagnementsRealisesLoader()
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()

  // Récupérer les données communes
  const [lieuxReadModel, mediateursReadModel, accompagnementsReadModel] = await Promise.all([
    lieuxLoader.get(territoire),
    mediateursLoader.get(territoire),
    accompagnementsLoader.get(territoire),
  ])

  // Transformer en ViewModels
  const lieuxViewModel = handleReadModelOrError(lieuxReadModel, lieuxInclusionNumeriquePresenter)
  const mediateursViewModel = handleReadModelOrError(mediateursReadModel, mediateursEtAidantsPresenter)
  const accompagnementsViewModel = handleReadModelOrError(accompagnementsReadModel, accompagnementsRealisesPresenter)

  // Charger et transformer les indices de fragilité selon le niveau
  let indicesFragilite
  if (niveau === 'national') {
    const indicesReadModel = await indicesLoader.getForFrance()
    indicesFragilite = isErrorReadModel(indicesReadModel)
      ? { message: indicesReadModel.message, type: 'error' as const }
      : indiceFragiliteDepartementsPresenter(indicesReadModel.departements)
  } else {
    const indicesReadModel = await indicesLoader.getForDepartement(codeDepartement ?? '')
    indicesFragilite = handleReadModelOrError(indicesReadModel, indiceFragilitePresenter)
  }

  return (
    <div
      className="fr-pr-lg-10w"
      style={{ display: 'flex', flexDirection: 'column' }}
    >
      <EtatDesLieux
        accompagnementsRealisesViewModel={accompagnementsViewModel}
        afficherLienLieux={false}
        carte={
          <CarteIndicesFragilite
            codeDepartement={codeDepartement ?? ''}
            indicesFragilite={indicesFragilite}
            niveau={niveau}
          />
        }
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

type Props = Readonly<{
  params: Promise<{
    code?: ReadonlyArray<string>
    niveau: string
  }>
}>
