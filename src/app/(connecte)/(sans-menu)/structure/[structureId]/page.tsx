import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Structure from '@/components/Structure/Structure'
import { PrismaUneStructureLoader } from '@/gateways/PrismaUneStructureLoader'
import { structurePresenter } from '@/presenters/structurePresenter'
import { RecupererUneStructure } from '@/use-cases/queries/RecupererUneStructure'

export default async function StructureController({ params }: Props): Promise<ReactElement> {
  const { structureId } = await params

  if (!structureId) {
    notFound()
  }

  // Convertir l'ID en nombre
  const structureIdNumeric = Number.parseInt(structureId, 10)

  if (Number.isNaN(structureIdNumeric)) {
    notFound()
  }

  // Instancier le loader
  const uneStructureLoader = new PrismaUneStructureLoader()

  // Appeler le use case
  const uneStructureReadModel = await new RecupererUneStructure(uneStructureLoader)
    .handle({ structureId: structureIdNumeric })

  // Transformer en ViewModel
  const viewModel = structurePresenter(uneStructureReadModel, new Date())

  return (
    <Structure viewModel={viewModel} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    structureId: string
  }>>
}>
