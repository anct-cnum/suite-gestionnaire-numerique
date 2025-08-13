import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { ReactElement } from 'react'

import ListeLieuxInclusion from '@/components/ListeLieuxInclusion/ListeLieuxInclusion'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { getSession } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaListeLieuxInclusionLoader } from '@/gateways/PrismaListeLieuxInclusionLoader'
import { PrismaUtilisateurLoader } from '@/gateways/PrismaUtilisateurLoader'
import { listeLieuxInclusionPresenter } from '@/presenters/listeLieuxInclusionPresenter'
import { isNullishOrEmpty } from '@/shared/lang'

export const metadata: Metadata = {
  title: 'Liste des lieux d\'inclusion numérique',
}

export default async function ListeLieuxInclusionController({
  searchParams,
}: {
  readonly searchParams: Promise<{ page?: string }>
}): Promise<ReactElement> {
  const session = await getSession()
  if (!session) {
    redirect('/connexion')
  }

  const utilisateurLoader = new PrismaUtilisateurLoader()
  const utilisateur = await utilisateurLoader.findByUid(session.user.sub)

  let codeDepartement: string | undefined
  if(utilisateur.role.type === 'gestionnaire_departement' && utilisateur.departementCode !== null) {
    codeDepartement = utilisateur.departementCode
  }

  const searchParamsAwaited = await searchParams
  const pageAwaited = searchParamsAwaited.page
  const page = isNullishOrEmpty(pageAwaited) ? 0 : Number(pageAwaited)
  const limite = 10

  const listeLieuxInclusionLoader = new PrismaListeLieuxInclusionLoader()
  const listeLieuxInclusionReadModel = await listeLieuxInclusionLoader.getLieuxWithPagination(
    page,
    limite,
    codeDepartement
  )

  const listeLieuxInclusionViewModel = handleReadModelOrError(
    listeLieuxInclusionReadModel,
    listeLieuxInclusionPresenter
  )

  return (
    <ListeLieuxInclusion
      listeLieuxInclusionViewModel={listeLieuxInclusionViewModel}
    />
  )
}
