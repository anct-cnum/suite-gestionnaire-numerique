import { notFound, redirect } from 'next/navigation'

import { PrismaPosteConseillerNumeriqueDetailLoader } from '@/gateways/PrismaPosteConseillerNumeriqueDetailLoader'

export default async function RedirectPosteVersStructure({ params }: Props): Promise<never> {
  const { posteConumId } = await params

  if (!posteConumId) {
    notFound()
  }

  const posteConumIdNumeric = Number.parseInt(posteConumId, 10)

  if (Number.isNaN(posteConumIdNumeric)) {
    notFound()
  }

  const loader = new PrismaPosteConseillerNumeriqueDetailLoader()
  const structureId = await loader.getFirstStructureId(posteConumIdNumeric)

  if (structureId === null) {
    notFound()
  }

  redirect(`/poste/${posteConumId}/structure/${structureId}`)
}

type Props = Readonly<{
  params: Promise<Readonly<{
    posteConumId: string
  }>>
}>
