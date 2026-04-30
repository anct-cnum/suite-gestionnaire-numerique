import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import Gouvernances from '@/components/Gouvernances/Gouvernances'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { Administrateur } from '@/domain/Administrateur'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { PrismaAutresStructuresLoader } from '@/gateways/tableauDeBord/PrismaAutresStructuresImpliquéesLoader'
import { PrismaCollectivitesLoader } from '@/gateways/tableauDeBord/PrismaCollectivitesImpliquéesLoader'
import { PrismaFeuillesDeRouteDeposeesLoader } from '@/gateways/tableauDeBord/PrismaFeuillesDeRouteDeposeesLoader'
import { PrismaGouvernancesTerritorialesLoader } from '@/gateways/tableauDeBord/PrismaGouvernancesTerritorialesLoader'
import { autresStructuresPresenter } from '@/presenters/tableauDeBord/autresStructuresImpliquéesPresenter'
import { collectivitesPresenter } from '@/presenters/tableauDeBord/collectivitesImpliquéesPresenter'
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

  const utilisateurLoader = new PrismaUtilisateurRepository(prisma.utilisateurRecord)
  const utilisateur = await utilisateurLoader.get(await getSessionSub())

  // Vérifier que l'utilisateur est bien administrateur_dispositif
  if (!(utilisateur instanceof Administrateur)) {
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

  const collectivitesLoader = new PrismaCollectivitesLoader()
  const collectivitesReadModel = await collectivitesLoader.get()
  const collectivitesViewModel = handleReadModelOrError(collectivitesReadModel, collectivitesPresenter)

  const autresStructuresLoader = new PrismaAutresStructuresLoader()
  const autresStructuresReadModel = await autresStructuresLoader.get()
  const autresStructuresViewModel = handleReadModelOrError(autresStructuresReadModel, autresStructuresPresenter)

  const dateGeneration = new Date()

  return (
    <Gouvernances
      autresStructuresViewModel={autresStructuresViewModel}
      collectivitesViewModel={collectivitesViewModel}
      dateGeneration={dateGeneration}
      feuillesDeRouteDeposeesViewModel={feuillesDeRouteDeposeesViewModel}
      gouvernancesTerritorialesViewModel={gouvernancesTerritorialesViewModel}
    />
  )
}
