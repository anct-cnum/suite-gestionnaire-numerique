import { Metadata } from 'next'
import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import FeuilleDeRouteVitrine from '@/components/vitrine/FeuilleDeRoute/FeuilleDeRouteVitrine'
import { PrismaLesFeuillesDeRouteLoader } from '@/gateways/PrismaLesFeuillesDeRouteLoader'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'
import { etablirSyntheseFinanciereGouvernance } from '@/use-cases/services/EtablirSyntheseFinanciereGouvernance'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const codeDepartement = code?.[0]

  return generateTerritoireMetadata(niveau, codeDepartement, {
    descriptionTemplate: 'Découvrez les feuilles de route de l\'inclusion numérique pour {territoire}. Actions, financements et objectifs du programme France Numérique Ensemble.',
    keywords: ['feuille de route', 'inclusion numérique', 'France Numérique Ensemble', 'actions territoriales', 'financement'],
    titleTemplate: 'Feuilles de route - {territoire} - Inclusion Numérique',
  })
}

/**
 * Page vitrine affichant les feuilles de route d'inclusion numérique
 * Charge les vraies données depuis la base pour les départements uniquement
 */
export default async function FeuilleDeRoute({ params }: Props): Promise<ReactElement> {
  const { code, niveau } = await params

  // Rediriger vers la page d'accueil des données territoriales si niveau national ou régional
  if (niveau === 'national' || niveau === 'region') {
    redirect('/vitrine/donnees-territoriales/synthese-et-indicateurs/national')
  }

  // Pour la vitrine, on affiche uniquement les données départementales
  if (niveau !== 'departement' || code === undefined || code.length === 0) {
    notFound()
  }

  const codeDepartement = code[0]

  try {
    const feuillesDeRouteReadModel = await new PrismaLesFeuillesDeRouteLoader(etablirSyntheseFinanciereGouvernance)
      .get(codeDepartement)
    const feuillesDeRouteViewModel = feuillesDeRoutePresenter(feuillesDeRouteReadModel)

    return <FeuilleDeRouteVitrine feuillesDeRouteViewModel={feuillesDeRouteViewModel} />
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    code?: ReadonlyArray<string>
    niveau: string
  }>>
}>
