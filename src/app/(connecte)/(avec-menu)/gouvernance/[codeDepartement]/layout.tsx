import { notFound, redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import GouvernanceProvider from '@/components/shared/GouvernanceContext'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { PrismaMembreRepository } from '@/gateways/PrismaMembreRepository'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function Layout({
  children,
  params,
}: Props): Promise<ReactElement> {
  try {
    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }
    const codeDepartement = (await params).codeDepartement
    const utilisateurLoader = new PrismaUtilisateurLoader()
    const utilisateur = await utilisateurLoader.findByUid(session.user.sub)
    const gouvernanceReadModel = await new RecupererUneGouvernance(
      new PrismaGouvernanceLoader(),
      new PrismaMembreRepository()
    ).handle({
      codeDepartement,
      uidUtilisateurCourant: utilisateur.uid,
    })

    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, new Date())

    return (
      <GouvernanceProvider gouvernanceViewModel={gouvernanceViewModel}>
        {children}
      </GouvernanceProvider>
    )
  } catch {
    notFound()
  }
}

type Props = PropsWithChildren<Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>>
