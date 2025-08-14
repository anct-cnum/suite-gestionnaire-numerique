import { Metadata } from 'next'
import { ReactElement } from 'react'

import ListeAidantsMediateurs from '@/components/ListeAidantsMediateurs/ListeAidantsMediateurs'
import { PrismaListeAidantsMediateursLoader } from '@/gateways/PrismaListeAidantsMediateursLoader'
import { listeAidantsMediateursPresenter } from '@/presenters/listeAidantsMediateursPresenter'

export const metadata: Metadata = {
  title: 'Liste des aidants et mdiateurs numriques',
}

export default async function ListeAidantsMediateursController({
  searchParams,
}: {
  readonly searchParams: Promise<{ page?: string }>
}): Promise<ReactElement> {
  const resolvedSearchParams = await searchParams
  const page = Number(resolvedSearchParams.page ?? '1')
  const limite = 10
  const territoire = 'France'

  const listeAidantsMediateursLoader = new PrismaListeAidantsMediateursLoader()
  const listeAidantsMediateursReadModel = await listeAidantsMediateursLoader.get(territoire, page, limite)
  const listeAidantsMediateursViewModel = listeAidantsMediateursPresenter(listeAidantsMediateursReadModel)

  return (
    <ListeAidantsMediateurs
      listeAidantsMediateursViewModel={listeAidantsMediateursViewModel}
    />
  )
}