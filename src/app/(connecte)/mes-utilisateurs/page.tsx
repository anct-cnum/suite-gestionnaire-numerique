import { Metadata } from 'next'
import { ReactElement } from 'react'

import prisma from '../../../../prisma/prismaClient'
import MesUtilisateurs from '@/components/MesUtilisateurs/MesUtilisateurs'
import { PostgreUtilisateurLoader } from '@/gateways/PostgreUtilisateurLoader'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'

export const metadata: Metadata = {
  title: 'Mes utilisateurs',
}

export default async function MesUtilisateursController({ searchParams }: PageProps): Promise<ReactElement> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const session = (await getSession())!
  const pageCourante = searchParams.page !== undefined ? { pageCourante: Number(searchParams.page) } : {}
  const utilisateursActives = Boolean(searchParams.utilisateursActives)
  const codeDepartement =
    searchParams.codeDepartement !== undefined ? { codeDepartement: searchParams.codeDepartement } : {}
  const codeRegion = searchParams.codeRegion !== undefined ? { codeRegion: searchParams.codeRegion } : {}
  const roles = searchParams.roles === undefined || searchParams.roles === '' ? {} : { roles: searchParams.roles.split(',') }

  const utilisateurLoader = new PostgreUtilisateurLoader(prisma)
  const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(utilisateurLoader)
  const { utilisateursCourants, total } =
    await rechercherMesUtilisateurs.get({
      uid: session.user.sub,
      utilisateursActives,
      ...codeDepartement,
      ...codeRegion,
      ...pageCourante,
      ...roles,
    })
  const mesUtilisateursViewModel = mesUtilisateursPresenter(
    utilisateursCourants,
    session.user.sub,
    total
  )

  return (
    <MesUtilisateurs mesUtilisateursViewModel={mesUtilisateursViewModel} />
  )
}

type PageProps = Readonly<{
  searchParams: Partial<Readonly<{
    codeDepartement: string
    codeRegion: string
    page: string
    roles: string
    utilisateursActives: string
  }>>
}>
