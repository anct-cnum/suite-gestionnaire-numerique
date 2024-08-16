import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../prisma/prismaClient'
import MesInformationsPersonnelles from '@/components/MesInformationsPersonnelles/MesInformationsPersonnelles'
import { PostgreMesInformationsPersonnellesQuery } from '@/gateways/PostgreMesInformationsPersonnellesQuery'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'

export const metadata: Metadata = {
  title: 'Mes informations personnelles',
}

export default async function MesInformationsPersonnellesController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const mesInformationsPersonnellesQuery = new PostgreMesInformationsPersonnellesQuery(prisma)
  const mesInformationsPersonnelles =
    await mesInformationsPersonnellesQuery.findBySub(session.user.sub)
  const mesInformationsPersonnellesViewModel = mesInformationsPersonnellesPresenter(mesInformationsPersonnelles)

  return (
    <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
  )
}
