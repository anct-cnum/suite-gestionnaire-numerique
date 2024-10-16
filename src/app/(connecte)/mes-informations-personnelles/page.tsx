import { Metadata } from 'next'
import { ReactElement } from 'react'

import prisma from '../../../../prisma/prismaClient'
import MesInformationsPersonnelles from '@/components/MesInformationsPersonnelles/MesInformationsPersonnelles'
import { PostgreMesInformationsPersonnellesLoader } from '@/gateways/PostgreMesInformationsPersonnellesLoader'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'

export const metadata: Metadata = {
  title: 'Mes informations personnelles',
}

export default async function MesInformationsPersonnellesController(): Promise<ReactElement> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const session = (await getSession())!

  const mesInformationsPersonnellesQuery = new PostgreMesInformationsPersonnellesLoader(prisma)
  const mesInformationsPersonnellesReadModel = await mesInformationsPersonnellesQuery.findByUid(session.user.sub)
  const mesInformationsPersonnellesViewModel =
    mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)

  return (
    <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
  )
}
