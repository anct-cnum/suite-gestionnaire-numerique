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
import { fetchBeneficiaires } from '@/use-cases/queries/fetchBeneficiaires'
import { RecupererAccompagnementsEtMediateurs } from '@/use-cases/queries/RecupererAccompagnementsEtMediateurs'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs numériques',
}

export default async function AidantsMediateursGouvernanceController({ params }: Props): Promise<ReactElement> {
  const session = await getSession()
  const { codeDepartement } = await params

  if (!session) {
    redirect('/connexion')
  }

  const accompagnementsEtMediateursUseCase = new RecupererAccompagnementsEtMediateurs(
    new PrismaAccompagnementsEtMediateursLoader()
  )
  const accompagnementsEtMediateursReadModel = 
    await accompagnementsEtMediateursUseCase.execute({ territoire: codeDepartement })
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
  
  // Créer la promesse pour les bénéficiaires (sera streamée au client)
  const beneficiairesPromise = fetchBeneficiaires(codeDepartement)
    
  return (
    <AidantsMediateurs
      accompagnementsEtMediateursViewModel={accompagnementsEtMediateursViewModel}
      beneficiairesPromise={beneficiairesPromise}
      dateGeneration={dateGeneration}
      niveauDeFormationViewModel={niveauDeFormationViewModel}
    />
  )
}

interface Props {
  readonly params: Promise<{ codeDepartement: string }>
}