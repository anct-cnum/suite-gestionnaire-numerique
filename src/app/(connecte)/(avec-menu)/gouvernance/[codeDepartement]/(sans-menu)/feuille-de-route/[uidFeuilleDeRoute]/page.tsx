import { notFound, redirect } from 'next/navigation'
import { ReactElement } from 'react'

import FeuilleDeRoute from '@/components/FeuilleDeRoute/FeuilleDeRoute'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUneFeuilleDeRouteLoader } from '@/gateways/PrismaUneFeuilleDeRouteLoader'
import { feuilleDeRoutePresenter } from '@/presenters/feuilleDeRoutePresenter'
import { etablirSyntheseFinanciereGouvernance } from '@/use-cases/services/EtablirSyntheseFinanciereGouvernance'

export default async function FeuilleDeRouteController({ params }: Props): Promise<ReactElement> {
  try {
    const { uidFeuilleDeRoute } = await params
    const session = await getSession()

    if (!session) {
      redirect('/connexion')
    }
    const readModel = await new PrismaUneFeuilleDeRouteLoader(
      etablirSyntheseFinanciereGouvernance
    ).get(uidFeuilleDeRoute)

    return (
      <FeuilleDeRoute viewModel={feuilleDeRoutePresenter(readModel)} />
    )
  } catch{
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
    uidFeuilleDeRoute: string
  }>>
}>
