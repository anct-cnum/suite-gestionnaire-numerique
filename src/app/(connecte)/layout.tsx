import { redirect } from 'next/navigation'
import { PropsWithChildren, ReactElement } from 'react'

import prisma from '../../../prisma/prismaClient'
import SessionUtilisateurContext from '@/components/shared/SessionUtilisateurContext'
import EnTete from '@/components/transverse/EnTete/EnTete'
import LienEvitement from '@/components/transverse/LienEvitement/LienEvitement'
import PiedDePage from '@/components/transverse/PiedDePage/PiedDePage'
import config from '@/config.json'
import { PostgreUtilisateurLoader } from '@/gateways/PostgreUtilisateurLoader'
import { PostgreUtilisateurRepository } from '@/gateways/PostgreUtilisateurRepository'
import { getSession } from '@/gateways/ProConnectAuthentificationGateway'
import { EnregistrerNomPrenomSiAbsents } from '@/use-cases/commands/EnregistrerNomPrenomSiAbsents'

export default async function Layout({ children }: PropsWithChildren): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const postgreUtilisateurPostgreUtilisateurLoader = new PostgreUtilisateurLoader(prisma)
  let utilisateurReadModel = await postgreUtilisateurPostgreUtilisateurLoader.findBySsoId(session.user.sub)
  const correctionNomPrenom = await new EnregistrerNomPrenomSiAbsents(
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
    valeurNomOuPrenomAbsent: config.absenceNomOuPrenom,
  })

  if (correctionNomPrenom === 'okAvecMiseAJour') {
    utilisateurReadModel = await postgreUtilisateurPostgreUtilisateurLoader.findBySsoId(session.user.sub)
  }

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
