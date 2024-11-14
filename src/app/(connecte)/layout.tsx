import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'
import { ToastContainer } from 'react-toastify'

import prisma from '../../../prisma/prismaClient'
import ClientContext from '@/components/shared/ClientContext'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { Roles } from '@/domain/Role'
import { PostgreUtilisateurLoader } from '@/gateways/PostgreUtilisateurLoader'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { createSessionUtilisateurPresenter } from '@/presenters/sessionUtilisateurPresenter'
import { CorrigerNomPrenomSiAbsents } from '@/use-cases/commands/CorrigerNomPrenomSiAbsents'
import config from '@/use-cases/config.json'

export default async function Layout({ children }: PropsWithChildren): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const postgreUtilisateurPostgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)
  let utilisateurReadModel = await postgreUtilisateurPostgreUtilisateurLoader.findByUid(session.user.sub)
  const correctionNomPrenom = await new CorrigerNomPrenomSiAbsents(
    new PostgreUtilisateurRepository(prisma)
  ).execute({
    actuels: {
      nom: utilisateurReadModel.nom,
      prenom: utilisateurReadModel.prenom,
    },
    corriges: {
      nom: session.user.usual_name,
      prenom: session.user.given_name,
    },
    uid: session.user.sub,
  })

  if (correctionNomPrenom === 'okAvecMiseAJour') {
    utilisateurReadModel = await postgreUtilisateurPostgreUtilisateurLoader.findByUid(session.user.sub)
  }

  const sessionUtilisateurViewModel = createSessionUtilisateurPresenter(utilisateurReadModel)

  return (
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
  )
}
