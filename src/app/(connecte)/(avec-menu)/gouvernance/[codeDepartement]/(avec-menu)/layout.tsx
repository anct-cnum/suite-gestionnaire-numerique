import { notFound, redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import prisma from '../../../../../../../prisma/prismaClient'
import MenuLateral from '@/components/transverse/MenuLateral/MenuLateral'
import { SousMenuGouvernance } from '@/components/transverse/MenuLateral/SousMenuGouvernance'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
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
      new PrismaUtilisateurRepository(prisma.utilisateurRecord)
    ).handle({
      codeDepartement,
      uidUtilisateurCourant: utilisateur.uid,
    })

    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, new Date())

    const afficherSousMenuMembre = gouvernanceViewModel.sectionMembres.coporteurs.length > 0
    const afficherSousMenuFeuilleDeRoute = Number(gouvernanceViewModel.sectionFeuillesDeRoute.total) > 0
    const afficherSouSMenu = afficherSousMenuMembre || afficherSousMenuFeuilleDeRoute
    return (
      <div className="fr-grid-row">
        <div className="fr-col-3 fr-col-lg-2">
          {
            afficherSouSMenu ?
              <MenuLateral>
                <SousMenuGouvernance
                  isAfficherSousMenuFeuilleDeRoute={afficherSousMenuFeuilleDeRoute}
                  isAfficherSousMenuMembre={afficherSousMenuMembre}
                />
              </MenuLateral>
              :
              <MenuLateral />
          }
        </div>
        <div className="fr-col-9 fr-col-lg-10 fr-pl-7w menu-border">
          {children}
        </div>
      </div>
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
