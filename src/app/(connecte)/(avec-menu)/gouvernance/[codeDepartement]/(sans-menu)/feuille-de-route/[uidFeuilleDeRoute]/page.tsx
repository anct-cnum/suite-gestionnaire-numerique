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
    console.log('[Page FeuilleDeRoute] Paramètres:', codeDepartement, uidFeuilleDeRoute)

    const session = await getSession()
    console.log('[Page FeuilleDeRoute] Session existe:', !!session)

    if (!session) {
      redirect('/connexion')
    }

    const feuilleDeRouteReadModel = await new PrismaUneFeuilleDeRouteLoader(
      etablirSyntheseFinanciereGouvernance
    ).get(uidFeuilleDeRoute)
    console.log('[Page FeuilleDeRoute] Vérification gouvernance:',
      feuilleDeRouteReadModel.uidGouvernance, '===', codeDepartement)

    if (feuilleDeRouteReadModel.uidGouvernance !== codeDepartement) {
      notFound()
    }
  
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(session.user.sub)
    console.log('[Page FeuilleDeRoute] Utilisateur rôle:', utilisateur.role.nom)

    const gouvernanceReadModel = await new RecupererUneGouvernance(
      new PrismaGouvernanceLoader(etablirSyntheseFinanciereGouvernance),
      new PrismaUtilisateurRepository(prisma.utilisateurRecord),
      new Date()
    ).handle({
      codeDepartement,
      uidUtilisateurCourant: utilisateur.uid,
    })
    console.log('[Page FeuilleDeRoute] peutGererGouvernance:', gouvernanceReadModel.peutGererGouvernance)

    return (
      <FeuilleDeRoute viewModel={feuilleDeRoutePresenter(feuilleDeRouteReadModel, gouvernanceReadModel)} />
    )
  } catch(error) {
    console.error('[Page FeuilleDeRoute] Erreur:', error)
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
    uidFeuilleDeRoute: string
  }>>
}>
