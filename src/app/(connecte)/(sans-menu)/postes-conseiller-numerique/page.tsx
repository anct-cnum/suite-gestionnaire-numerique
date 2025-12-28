import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListePostesConseillerNumerique from '@/components/PostesConseillerNumerique/ListePostesConseillerNumerique'
import { getSession, getSessionSub } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMembreLoader } from '@/gateways/PrismaMembreLoader'
import { PrismaPostesConseillerNumeriqueLoader } from '@/gateways/PrismaPostesConseillerNumeriqueLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { postesConseillerNumeriquePresenter } from '@/presenters/postesConseillerNumeriquePresenter'
import config from '@/use-cases/config.json'
import { RecupererTerritoireUtilisateur } from '@/use-cases/queries/RecupererTerritoireUtilisateur'

export const metadata: Metadata = {
  title: 'Suivi des postes Conseiller Numérique',
}

export default async function PostesConseillerNumeriqueController({
  searchParams,
}: {
  readonly searchParams: Promise<{
    page?: string
  }>
}): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams

  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(await getSessionSub())

  const territoireUseCase = new RecupererTerritoireUtilisateur(new PrismaMembreLoader())
  const territoireResult = await territoireUseCase.handle(utilisateur)

  let territoire: string
  if (territoireResult.type === 'france') {
    territoire = 'France'
  } else if (territoireResult.codes.length > 0) {
    territoire = territoireResult.codes[0]
  } else {
    redirect('/')
  }

  const page = resolvedSearchParams.page !== undefined && resolvedSearchParams.page !== ''
    ? parseInt(resolvedSearchParams.page, 10)
    : 1

  const postesLoader = new PrismaPostesConseillerNumeriqueLoader()
  const postesReadModel = await postesLoader.get({
    pagination: {
      limite: config.utilisateursParPage,
      page,
    },
    territoire,
  })

  const postesConseillerNumeriqueViewModel = postesConseillerNumeriquePresenter(postesReadModel)

  return (
    <ListePostesConseillerNumerique
      postesConseillerNumeriqueViewModel={postesConseillerNumeriqueViewModel}
    />
  )
}
