import { Metadata } from 'next'
import { ReactElement } from 'react'

import prisma from '../../../../../prisma/prismaClient'
import MesInformationsPersonnelles from '@/components/MesInformationsPersonnelles/MesInformationsPersonnelles'
import { PostgreMesInformationsPersonnellesLoader } from '@/gateways/PostgreMesInformationsPersonnellesLoader'
import { getSubSession } from '@/gateways/ProConnectAuthentificationGateway'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'

export const metadata: Metadata = {
  title: 'Mes informations personnelles',
}

export default async function MesInformationsPersonnellesController(): Promise<ReactElement> {
  const mesInformationsPersonnellesQuery = new PostgreMesInformationsPersonnellesLoader(prisma)
  const mesInformationsPersonnellesReadModel = await mesInformationsPersonnellesQuery.findByUid(await getSubSession())
  const mesInformationsPersonnellesViewModel =
    mesInformationsPersonnellesPresenter(mesInformationsPersonnellesReadModel)

  return (
    <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
  )
}
