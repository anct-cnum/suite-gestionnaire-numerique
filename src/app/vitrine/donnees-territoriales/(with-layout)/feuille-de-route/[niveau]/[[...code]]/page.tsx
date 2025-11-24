import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import FeuilleDeRouteVitrine from '@/components/vitrine/FeuilleDeRoute/FeuilleDeRouteVitrine'
import { PrismaLesFeuillesDeRouteLoader } from '@/gateways/PrismaLesFeuillesDeRouteLoader'
import { feuillesDeRoutePresenter } from '@/presenters/feuillesDeRoutePresenter'
import { etablirSyntheseFinanciereGouvernance } from '@/use-cases/services/EtablirSyntheseFinanciereGouvernance'

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
