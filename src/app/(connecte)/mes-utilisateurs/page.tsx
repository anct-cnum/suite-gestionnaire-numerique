import { Metadata } from 'next'
import { ReactElement } from 'react'

import prisma from '../../../../prisma/prismaClient'
import MesUtilisateurs from '@/components/MesUtilisateurs/MesUtilisateurs'
import { PostgreUtilisateurLoader } from '@/gateways/PostgreUtilisateurLoader'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { mesUtilisateursPresenter } from '@/presenters/mesUtilisateursPresenter'
import config from '@/use-cases/config.json'
import { RechercherMesUtilisateurs } from '@/use-cases/queries/RechercherMesUtilisateurs'

export const metadata: Metadata = {
  title: 'Mes utilisateurs',
}

export default async function MesUtilisateursController({ searchParams }: PageProps): Promise<ReactElement> {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  const session = (await getSession())!
  const pageCourante = Number(searchParams.page ?? 0)
  const utilisateursActives = Boolean(searchParams.utilisateursActives)

  const utilisateurLoader = new PostgreUtilisateurLoader(prisma)
  const rechercherMesUtilisateurs = new RechercherMesUtilisateurs(utilisateurLoader)
  const { utilisateursCourants, total } =
    await rechercherMesUtilisateurs.get({
      pageCourante,
      ssoId: session.user.sub,
      utilisateursActives,
      utilisateursParPage: config.utilisateursParPage,
    })
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
    utilisateursActives: string
  }>>
}>
