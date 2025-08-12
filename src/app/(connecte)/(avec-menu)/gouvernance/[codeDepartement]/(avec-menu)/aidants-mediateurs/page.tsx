import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import AidantsMediateurs from '@/components/AidantsMediateurs/AidantsMediateurs'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { PrismaAccompagnementsEtMediateursLoader } from '@/gateways/aidantsMedIateurs/PrismaAccompagnementsEtMediateursLoader'
import { PrismaNiveauDeFormationLoader } from '@/gateways/aidantsMedIateurs/PrismaNiveauDeFormationLoader'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { accompagnementsEtMediateursPresenter } from '@/presenters/tableauDeBord/accompagnementsEtMediateursPresenter'
import { niveauDeFormationPresenter } from '@/presenters/tableauDeBord/niveauDeFormationPresenter'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs numériques',
}

export default async function AidantsMediateursGouvernanceController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()
  const { codeDepartement } = await params

  if (!session) {
    redirect('/connexion')
  }

  const accompagnementsEtMediateursLoader = new PrismaAccompagnementsEtMediateursLoader()
  const accompagnementsEtMediateursReadModel = await accompagnementsEtMediateursLoader.get(codeDepartement)
  const accompagnementsEtMediateursViewModel = handleReadModelOrError(
    accompagnementsEtMediateursReadModel,
    accompagnementsEtMediateursPresenter
  )

  const niveauDeFormationLoader = new PrismaNiveauDeFormationLoader()
  const niveauDeFormationReadModel = await niveauDeFormationLoader.get(codeDepartement)
  const niveauDeFormationViewModel = handleReadModelOrError(
    niveauDeFormationReadModel,
    niveauDeFormationPresenter
  )

  const dateGeneration = new Date()
    
  return (
    <AidantsMediateurs
      accompagnementsEtMediateursViewModel={accompagnementsEtMediateursViewModel}
      dateGeneration={dateGeneration}
      niveauDeFormationViewModel={niveauDeFormationViewModel}
    />
  )
}

interface Props {
  readonly params: Promise<{ codeDepartement: string }>
}