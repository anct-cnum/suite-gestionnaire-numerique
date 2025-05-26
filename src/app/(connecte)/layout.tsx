import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'
import { ToastContainer } from 'react-toastify'

import ClientContext from '@/components/shared/ClientContext'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { Roles } from '@/domain/Role'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { createSessionUtilisateurPresenter } from '@/presenters/sessionUtilisateurPresenter'
import config from '@/use-cases/config.json'

export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateurReadModel = await utilisateurLoader.findByUid(session.user.sub)
  const sessionUtilisateurViewModel = createSessionUtilisateurPresenter(utilisateurReadModel)

  return (
    <ClientContext
      roles={Roles}
      sessionUtilisateurViewModel={sessionUtilisateurViewModel}
      utilisateursParPage={config.utilisateursParPage}
    >
      <LienEvitement />
      <ToastContainer style={{ width: '30rem' }} />
      <div className="page-container">
        <EnTete />
        <main
          className="fr-container--fluid main-content"
          id="content"
        >
          {children}
        </main>
        <PiedDePage />
      </div>
    </ClientContext>
  )
}
