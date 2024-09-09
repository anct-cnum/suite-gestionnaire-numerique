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
  const session = await getSession()
  const pageCourante = Number(searchParams.page ?? 0)

  const utilisateurQuery = new PostgreUtilisateurQuery(prisma)
  const mesUtilisateurs = await utilisateurQuery.findAll(pageCourante)
  const totalUtilisateur = await utilisateurQuery.count()
  const mesUtilisateursViewModel = mesUtilisateursPresenter(
    mesUtilisateurs,
    // @ts-expect-error
    session.user.sub,
    pageCourante,
    totalUtilisateur
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
