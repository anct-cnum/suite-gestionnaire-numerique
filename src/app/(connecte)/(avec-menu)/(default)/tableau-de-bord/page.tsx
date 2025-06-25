import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

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

  // Récupération des données depuis la base
  const lieuxInclusionLoader = new PrismaLieuxInclusionNumeriqueLoader()
  const lieuxInclusionReadModel = await lieuxInclusionLoader.get(departementCode)
  const lieuxInclusionViewModel = lieuxInclusionNumeriquePresenter(lieuxInclusionReadModel)

  const mediateursEtAidantsLoader = new PrismaMediateursEtAidantsLoader()
  const mediateursEtAidantsReadModel = await mediateursEtAidantsLoader.get(departementCode)
  const mediateursEtAidantsViewModel = mediateursEtAidantsPresenter(mediateursEtAidantsReadModel)

  const accompagnementsRealisesLoader = new PrismaAccompagnementsRealisesLoader()
  const accompagnementsRealisesReadModel = await accompagnementsRealisesLoader.get(departementCode)
  const accompagnementsRealisesViewModel = accompagnementsRealisesPresenter(accompagnementsRealisesReadModel)

  // Récupération des indices de fragilité
  const indicesLoader = new PrismaIndicesDeFragiliteLoader()
  const indicesReadModel = await indicesLoader.get(departementCode)
  const indicesFragilite = indiceFragiliteParCommunePresenter(indicesReadModel.communes)

  return (
    <TableauDeBord 
      accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
      departement={departementCode}
      indicesFragilite={indicesFragilite}
      lieuxInclusionViewModel={lieuxInclusionViewModel}
      mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
    />
  )
}
