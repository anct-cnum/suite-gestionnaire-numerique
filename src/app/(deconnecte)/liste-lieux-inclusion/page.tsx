import { Metadata } from 'next'
import { ReactElement } from 'react'

import ListeLieuxInclusion from '@/components/ListeLieuxInclusion/ListeLieuxInclusion'
import { handleReadModelOrError } from '@/components/shared/ErrorHandler'
import { PrismaListeLieuxInclusionLoader } from '@/gateways/PrismaListeLieuxInclusionLoader'
import { listeLieuxInclusionPresenter } from '@/presenters/listeLieuxInclusionPresenter'

export const metadata: Metadata = {
  title: 'Liste des lieux d\'inclusion numérique',
}

export default async function ListeLieuxInclusionController({
  searchParams,
}: {
  readonly searchParams: Promise<{ page?: string }>
}): Promise<ReactElement> {
  const params = await searchParams
  const page = Number(params.page ?? 0)
  const limite = 10

  const listeLieuxInclusionLoader = new PrismaListeLieuxInclusionLoader()
  const listeLieuxInclusionReadModel = await listeLieuxInclusionLoader.getLieuxWithPagination(page, limite)
  
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