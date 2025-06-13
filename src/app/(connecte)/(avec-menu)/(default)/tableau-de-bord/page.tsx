import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaTableauDeBordLoader } from '@/gateways/PrismaTableauDeBordLoader'
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

  const tableauDeBordLoader = await new PrismaTableauDeBordLoader().get('33' ?? '')
  const tableauDeBordViewModel = tableauDeBordPresenter(utilisateur.departementCode ?? '', tableauDeBordLoader)

  return (
    <TableauDeBord tableauDeBordViewModel={tableauDeBordViewModel} />
  )
}
