import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import GouvernancesList from '@/components/Gouvernances/GouvernancesList'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { gouvernancePresenter } from '@/presenters/gouvernancesPresenter'
import { RecupererGouvernancesInfos } from '@/use-cases/queries/RecupererGouvernancesInfos'
import { resoudreContexte } from '@/use-cases/queries/ResoudreContexte'

export default async function GouvernancesController(): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  const contexte = await resoudreContexte(utilisateur, new PrismaMembreLoader())
  const codesDepartements = contexte.codesDepartements()

  if (!contexte.estNational() && codesDepartements.length === 0) {
    redirect('/')
  }

  const gouvernancesReadModel = await new RecupererGouvernancesInfos().handle(
    contexte.estNational() ? undefined : { codesDepartements }
  )
  const gouvernancesViewModel = gouvernancePresenter(gouvernancesReadModel)

  return (
    <GouvernancesList
      details={gouvernancesViewModel.details}
    />
  )
}
