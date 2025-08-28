import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import AidantsMediateurs from '@/components/AidantsMediateurs/AidantsMediateurs'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { PrismaAccompagnementsEtMediateursLoader } from '@/gateways/aidantsMedIateurs/PrismaAccompagnementsEtMediateursLoader'
import { PrismaNiveauDeFormationLoader } from '@/gateways/aidantsMedIateurs/PrismaNiveauDeFormationLoader'
import { createApiCoopStatistiquesLoader } from '@/gateways/factories/apiCoopLoaderFactory'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { accompagnementsEtMediateursEnrichiPresenter } from '@/presenters/tableauDeBord/accompagnementsEtMediateursEnrichiPresenter'
import { niveauDeFormationPresenter } from '@/presenters/tableauDeBord/niveauDeFormationPresenter'
import { RecupererAccompagnementsEtMediateursEnrichi } from '@/use-cases/queries/RecupererAccompagnementsEtMediateursEnrichi'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs numériques',
}

export default async function AidantsMediateursNumeriquesController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(session.user.sub)

  // Vérifier que l'utilisateur est bien administrateur_dispositif
  if (utilisateur.role.type !== 'administrateur_dispositif') {
    redirect('/tableau-de-bord')
  }

  const accompagnementsEtMediateursUseCase = new RecupererAccompagnementsEtMediateursEnrichi(
    new PrismaAccompagnementsEtMediateursLoader(),
    createApiCoopStatistiquesLoader()
  )
  const accompagnementsEtMediateursReadModel = await accompagnementsEtMediateursUseCase.execute({ territoire: 'France' })
  const accompagnementsEtMediateursViewModel = handleReadModelOrError(
    accompagnementsEtMediateursReadModel,
    accompagnementsEtMediateursEnrichiPresenter
  )

  const niveauDeFormationLoader = new PrismaNiveauDeFormationLoader()
  const niveauDeFormationReadModel = await niveauDeFormationLoader.get()
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