import { Metadata } from 'next'
import { ReactElement } from 'react'

import prisma from '../../../../prisma/prismaClient'
import MesUtilisateurs from '@/components/MesUtilisateurs/MesUtilisateurs'
import { PostgreUtilisateurQuery } from '@/gateways/PostgreUtilisateurQuery'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'

export const metadata: Metadata = {
  title: 'Mes utilisateurs',
}

export default async function MesUtilisateursController({ searchParams }: PageProps): Promise<ReactElement> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const session = (await getSession())!
  const pageCourante = Number(searchParams.page ?? 0)

  const utilisateurQuery = new PostgreUtilisateurQuery(prisma)
  const { utilisateursCourants, total } =
    await utilisateurQuery.findMesUtilisateursEtLeTotal(session.user.sub, pageCourante)
  const mesUtilisateursViewModel = mesUtilisateursPresenter(
    utilisateursCourants,
    session.user.sub,
    pageCourante,
    total
  )

  return (
    <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />
  )
}

type PageProps = Readonly<{
  searchParams: Partial<Readonly<{
    page: string
  }>>
}>
