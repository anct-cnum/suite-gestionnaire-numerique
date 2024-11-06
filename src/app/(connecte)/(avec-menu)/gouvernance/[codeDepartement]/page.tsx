import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import Gouvernance from '@/components/Gouvernance/Gouvernance'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'

export const metadata: Metadata = {
  title: 'Gouvernance',
}

export default async function GouvernanceController({ params }: PageProps): Promise<ReactElement> {
  if (params.codeDepartement === undefined) {
    notFound()
  }

  const gouvernanceReadModel = await new PrismaGouvernanceLoader(prisma).find(params.codeDepartement)

  if (gouvernanceReadModel === null) {
    notFound()
  }

  const gouvernanceViewModel = gouvernanceReadModel

  return (
    <Gouvernance gouvernanceViewModel={gouvernanceViewModel} />
  )
}

type PageProps = Readonly<{
  params: Partial<Readonly<{
    codeDepartement: string
  }>>
}>
