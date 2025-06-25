import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaAccompagnementsRealisesLoader } from '@/gateways/PrismaAccompagnementsRealisesLoader'
import { PrismaIndicesDeFragiliteLoader } from '@/gateways/PrismaIndicesDeFragiliteLoader'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'
import { PrismaMediateursEtAidantsLoader } from '@/gateways/PrismaMediateursEtAidantsLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { accompagnementsRealisesPresenter } from '@/presenters/accompagnementsRealisesPresenter'
import { indiceFragilitePresenter as indiceFragiliteParCommunePresenter } from '@/presenters/indiceFragilitePresenter'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { mediateursEtAidantsPresenter } from '@/presenters/mediateursEtAidantsPresenter'
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

  const departementCode = utilisateur.departementCode ?? ''
  
  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const lieuxInclusionReadModel = await lieuxInclusionLoader.get(departementCode)
  const lieuxInclusionViewModel = handleReadModelOrError(
    lieuxInclusionReadModel,
    lieuxInclusionNumeriquePresenter
  )

  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get(departementCode)
  const mediateursEtAidantsViewModel = handleReadModelOrError(
    mediateursEtAidantsReadModel,
    mediateursEtAidantsPresenter
  )

  const accompagnementsRealisesLoader = new PrismaAccompagnementsRealisesLoader()
  const accompagnementsRealisesReadModel = await accompagnementsRealisesLoader.get(departementCode)
  const accompagnementsRealisesViewModel = handleReadModelOrError(
    accompagnementsRealisesReadModel,
    accompagnementsRealisesPresenter
  )

  const indicesLoader = new PrismaIndicesDeFragiliteLoader()
  const indicesReadModel = await indicesLoader.get(departementCode)
  const indicesFragilite = handleReadModelOrError(
    indicesReadModel,
    (readModel) => indiceFragiliteParCommunePresenter(readModel.communes)
  )

  const tableauDeBordViewModel = tableauDeBordPresenter(departementCode)

  return (
    <TableauDeBord 
      accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
      departement={departementCode}
      indicesFragilite={indicesFragilite}
      lieuxInclusionViewModel={lieuxInclusionViewModel}
      mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
      tableauDeBordViewModel={tableauDeBordViewModel}
    />
  )
}
