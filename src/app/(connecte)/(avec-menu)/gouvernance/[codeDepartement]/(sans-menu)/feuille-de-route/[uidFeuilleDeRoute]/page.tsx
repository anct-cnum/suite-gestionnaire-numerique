import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../../../../prisma/prismaClient'
import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { PrismaUneFeuilleDeRouteLoader } from '@/gateways/PrismaUneFeuilleDeRouteLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'
import { etablirSyntheseFinanciereGouvernance } from '@/use-cases/services/EtablirSyntheseFinanciereGouvernance'

export default async function FeuilleDeRouteController({ params }: Props): Promise<ReactElement> {
  try {
    const { codeDepartement, uidFeuilleDeRoute } = await params

    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }

    const feuilleDeRouteReadModel = await new PrismaUneFeuilleDeRouteLoader(
      etablirSyntheseFinanciereGouvernance
    ).get(uidFeuilleDeRoute)

    if (feuilleDeRouteReadModel.uidGouvernance !== codeDepartement) {
      notFound()
    }

    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(session.user.sub)

    const gouvernanceReadModel = await new RecupererUneGouvernance(
      new PrismaGouvernanceLoader(etablirSyntheseFinanciereGouvernance),
      new PrismaUtilisateurRepository(prisma.utilisateurRecord)
    ).handle({
      codeDepartement,
      uidUtilisateurCourant: utilisateur.uid,
    })

    return (
      <FeuilleDeRoute viewModel={feuilleDeRoutePresenter(feuilleDeRouteReadModel, gouvernanceReadModel)} />
    )
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
    uidFeuilleDeRoute: string
  }>>
}>
