import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import prisma from '../../../prisma/prismaClient'
import SessionUtilisateurContext from '@/components/shared/SessionUtilisateurContext'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { PostgreUtilisateurLoader } from '@/gateways/PostgreUtilisateurLoader'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'

export default async function Layout({ children }: PropsWithChildren): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const postgreUtilisateurPostgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)
  const utilisateurReadModel = await postgreUtilisateurPostgreUtilisateurLoader.findBySsoId(session.user.sub)

  return (
    <SessionUtilisateurContext utilisateurReadModel={utilisateurReadModel}>
      <LienEvitement />
      <EnTete />
      <main
        className="fr-container--fluid fr-mb-5w fr-mx-5w"
        id="content"
      >
        {children}
      </main>
      <PiedDePage />
    </SessionUtilisateurContext>
  )
}
