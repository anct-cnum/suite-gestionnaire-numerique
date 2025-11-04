import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'
import { ToastContainer } from 'react-toastify'

import ClientContext from '@/components/shared/ClientContext'
import DateProvider from '@/components/shared/DateProvider'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { Roles } from '@/domain/Role'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { createSessionUtilisateurPresenter } from '@/presenters/sessionUtilisateurPresenter'
import config from '@/use-cases/config.json'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export default async function Layout({ children }: Readonly<PropsWithChildren>): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }
  let utilisateurReadModel: UnUtilisateurReadModel
  try {
    const utilisateurLoader = new PrismaUtilisateurLoader()
    utilisateurReadModel = await utilisateurLoader.findByUid(session.user.sub)
  } catch {
    redirect('/api/auth/signout?callbackUrl=/connexion')
  }

  const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
  const territoire = await territoireUseCase.handle(utilisateurReadModel)

  const sessionUtilisateurViewModel = createSessionUtilisateurPresenter(utilisateurReadModel, territoire)

  return (
    <DateProvider>
      <ClientContext
        roles={Roles}
        sessionUtilisateurViewModel={sessionUtilisateurViewModel}
        utilisateursParPage={config.utilisateursParPage}
      >
        <LienEvitement />
        <ToastContainer style={{ width: '30rem' }} />
        <EnTete />
        <main
          className="fr-container--fluid fr-mx-5w"
          id="content"
        >
          {children}
        </main>
        <PiedDePage />
      </ClientContext>
    </DateProvider>
  )
}
