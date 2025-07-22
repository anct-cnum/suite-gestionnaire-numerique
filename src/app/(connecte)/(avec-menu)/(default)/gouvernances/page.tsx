import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import Gouvernances from '@/components/Gouvernances/Gouvernances'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaFeuillesDeRouteDeposeesLoader } from '@/gateways/tableauDeBord/PrismaFeuillesDeRouteDeposeesLoader'
import { PrismaGouvernancesTerritorialesLoader } from '@/gateways/tableauDeBord/PrismaGouvernancesTerritorialesLoader'
import { feuillesDeRouteDeposeesPresenter } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'
import { gouvernancesTerritorialesPresenter } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'

export const metadata: Metadata = {
  title: 'Gouvernances',
}

export default async function GouvernancesController(): Promise<ReactElement> {
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

  const gouvernancesTerritorialesLoader = new PrismaGouvernancesTerritorialesLoader()
  const gouvernancesTerritorialesReadModel = await gouvernancesTerritorialesLoader.get()
  const gouvernancesTerritorialesViewModel = handleReadModelOrError(
    gouvernancesTerritorialesReadModel,
    gouvernancesTerritorialesPresenter
  )

  const feuillesDeRouteDeposeesLoader = new PrismaFeuillesDeRouteDeposeesLoader()
  const feuillesDeRouteDeposeesReadModel = await feuillesDeRouteDeposeesLoader.get()
  const feuillesDeRouteDeposeesViewModel = handleReadModelOrError(
    feuillesDeRouteDeposeesReadModel,
    feuillesDeRouteDeposeesPresenter
  )

  const dateGeneration = new Date()
  
  return (
    <Gouvernances
      dateGeneration={dateGeneration}
      feuillesDeRouteDeposeesViewModel={feuillesDeRouteDeposeesViewModel}
      gouvernancesTerritorialesViewModel={gouvernancesTerritorialesViewModel}
    />
  )
}