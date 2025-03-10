import { notFound, redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import GouvernanceProvider from '@/components/shared/GouvernanceContext'
import MenuLateral from '@/components/transverse/MenuLateral/MenuLateral'
import { SousMenuGouvernance } from '@/components/transverse/MenuLateral/SousMenuGouvernance'
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

    const afficherSousMenuMembre = gouvernanceViewModel.sectionMembres.coporteurs.length > 0
    const afficherSousMenuFeuilleDeRoute = Number(gouvernanceViewModel.sectionFeuillesDeRoute.total) > 0
    const afficherSouSMenu = afficherSousMenuMembre || afficherSousMenuFeuilleDeRoute
    return (
      <GouvernanceProvider gouvernanceViewModel={gouvernanceViewModel}>
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
