import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import MesFeuillesDeRoute from '@/components/MesFeuillesDeRoute/MesFeuillesDeRoute'
import { PrismaLesFeuillesDeRouteLoader } from '@/gateways/PrismaLesFeuillesDeRouteLoader'
import { mesFeuillesDeRoutePresenter } from '@/presenters/mesFeuillesDeRoutePresenter'
import { RecupererLesFeuillesDeRoute } from '@/use-cases/queries/RecupererLesFeuillesDeRoute'

export default async function MesFeuillesDeRouteController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const mesFeuillesDeRouteReadModel = await
    new RecupererLesFeuillesDeRoute(
      new PrismaLesFeuillesDeRouteLoader(prisma.feuilleDeRouteRecord)
    ).handle({ codeDepartement })
    const mesFeuillesDeRouteViewModel = mesFeuillesDeRoutePresenter(mesFeuillesDeRouteReadModel)
    return (
      <MesFeuillesDeRoute mesFeuillesDeRouteViewModel={mesFeuillesDeRouteViewModel} />
    )
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
