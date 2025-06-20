import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/PrismaIndicesDeFragiliteLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { indiceFragilitePresenter as indiceFragiliteParCommunePresenter } from '@/presenters/indiceFragilitePresenter'
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

  const indicesLoader = new PrismaIndicesDeFragiliteLoader()
  const indicesReadModel = await indicesLoader.get(utilisateur.departementCode ?? '')
  const indicesFragilite = indiceFragiliteParCommunePresenter(indicesReadModel.communes)

  return (
    <TableauDeBord 
      indicesFragilite={indicesFragilite}
      tableauDeBordViewModel={tableauDeBordViewModel}
    />
  )
}
