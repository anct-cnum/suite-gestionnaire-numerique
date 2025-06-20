import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import Notice from '@/components/shared/Notice/Notice'
import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import { indiceFragilitePresenter } from '@/presenters/indiceFragilitePresenter'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBordPresenter'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default async function TableauDeBordController(): Promise<ReactElement> {
  const session = await getSession()

  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(session.user.sub)

  const tableauDeBordViewModel = tableauDeBordPresenter(utilisateur.departementCode ?? '')
  const communeFragilite = indiceFragilitePresenter('69')
  console.log(communeFragilite)
  return (
    <TableauDeBord 
        communeFragilite={communeFragilite}
	tableauDeBordViewModel={tableauDeBordViewModel} />
  )
}
