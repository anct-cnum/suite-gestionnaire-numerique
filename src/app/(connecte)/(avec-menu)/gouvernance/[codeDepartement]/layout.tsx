import { notFound } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import GouvernanceProvider from '@/components/shared/GouvernanceContext'
import MenuLateral from '@/components/transverse/MenuLateral/MenuLateral'
import { SousMenuGouvernance } from '@/components/transverse/MenuLateral/SousMenuGouvernance'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function Layout({
  children,
  params,
}: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const gouvernanceLoader = new PrismaGouvernanceLoader(prisma.gouvernanceRecord)
    const gouvernanceReadModel = await new RecupererUneGouvernance(gouvernanceLoader).handle({ codeDepartement })

    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, new Date())

    const afficherSousMenuMembre = Number(gouvernanceViewModel.sectionCoporteurs.total) > 0
    const afficherSousMenuFeuilleDeRoute = Number(gouvernanceViewModel.sectionFeuillesDeRoute.total) > 0
    const afficherSouSMenu = afficherSousMenuMembre || afficherSousMenuFeuilleDeRoute
    return (
      <GouvernanceProvider gouvernanceViewModel={gouvernanceViewModel}>
        <div className="fr-grid-row">
          <div className="fr-col-2">
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
          <div className="fr-col-9 fr-pl-7w menu-border">
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
