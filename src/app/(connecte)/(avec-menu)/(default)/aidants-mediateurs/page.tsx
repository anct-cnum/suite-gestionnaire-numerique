import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import AidantsMediateurs from '@/components/AidantsMediateurs/AidantsMediateurs'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { PrismaAccompagnementsEtMediateursLoader } from '@/gateways/aidantsMedIateurs/PrismaAccompagnementsEtMediateursLoader'
import { PrismaNiveauDeFormationLoader } from '@/gateways/aidantsMedIateurs/PrismaNiveauDeFormationLoader'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { accompagnementsEtMediateursPresenter } from '@/presenters/tableauDeBord/accompagnementsEtMediateursPresenter'
import { niveauDeFormationPresenter } from '@/presenters/tableauDeBord/niveauDeFormationPresenter'

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

  const accompagnementsEtMediateursLoader = new PrismaAccompagnementsEtMediateursLoader()
  const accompagnementsEtMediateursReadModel = await accompagnementsEtMediateursLoader.get()
  const accompagnementsEtMediateursViewModel = handleReadModelOrError(
    accompagnementsEtMediateursReadModel,
    accompagnementsEtMediateursPresenter
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