import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import prisma from '../../../prisma/prismaClient'
import SessionUtilisateurContext from '@/components/shared/SessionUtilisateurContext'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { PostgreUtilisateurQuery } from '@/gateways/PostgreUtilisateurQuery'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'

export default async function Layout({ children }: PropsWithChildren): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const postgreUtilisateurQuery = new PostgreUtilisateurQuery(prisma)
  const utilisateurState = await postgreUtilisateurQuery.findBySub(session.user.sub)

  return (
    <SessionUtilisateurContext utilisateurState={utilisateurState}>
      <LienEvitement />
      <EnTete />
      <main
        className="fr-container fr-pt-3w"
        id="content"
      >
        {children}
      </main>
      <PiedDePage />
    </SessionUtilisateurContext>
  )
}
