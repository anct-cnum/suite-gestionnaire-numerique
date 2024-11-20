import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'
import { ToastContainer } from 'react-toastify'

import prisma from '../../../prisma/prismaClient'
import ClientContext from '@/components/shared/ClientContext'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import { Roles } from '@/domain/Role'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { PrismaUtilisateurRepository } from '@/gateways/PrismaUtilisateurRepository'
import { createSessionUtilisateurPresenter } from '@/presenters/sessionUtilisateurPresenter'
import { CorrigerNomPrenomSiAbsents } from '@/use-cases/commands/CorrigerNomPrenomSiAbsents'
import { MettreAJourUidALaPremiereConnexion } from '@/use-cases/commands/MettreAJourUidALaPremiereConnexion'
import config from '@/use-cases/config.json'
import { UtilisateurNonTrouveError } from '@/use-cases/queries/RechercherUnUtilisateur'
import { UnUtilisateurReadModel } from '@/use-cases/queries/shared/UnUtilisateurReadModel'

export default async function Layout({ children }: PropsWithChildren): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurRepository = new PrismaUtilisateurRepository(prisma)
  const utilisateurLoader = new PrismaUtilisateurLoader(prisma)
  let utilisateurReadModel: UnUtilisateurReadModel | null = null

  try {
    utilisateurReadModel = await utilisateurLoader.findByUid(session.user.sub)
  } catch (error) {
    if (error instanceof UtilisateurNonTrouveError) {
      const result = await new MettreAJourUidALaPremiereConnexion(utilisateurRepository)
        .execute({
          email: session.user.email,
          uid: session.user.sub,
        })

      if (result === 'comptePremiereConnexionInexistant') {
        throw error
      }
    }
    utilisateurReadModel = await utilisateurLoader.findByUid(session.user.sub)
  }

  const correctionNomPrenom = await new CorrigerNomPrenomSiAbsents(utilisateurRepository)
    .execute({
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
    utilisateurReadModel = await utilisateurLoader.findByUid(session.user.sub)
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
