import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import Gouvernance from '@/components/Gouvernance/Gouvernance'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'

export const metadata: Metadata = {
  title: 'Gouvernance',
}

export default async function GouvernanceController({ params }: PageProps): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement

  if (codeDepartement === undefined) {
    notFound()
  }

  const gouvernanceReadModel = await new PrismaGouvernanceLoader(prisma).find(codeDepartement)

  if (gouvernanceReadModel === null) {
    notFound()
  }

  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel)

  return (
    <Gouvernance gouvernanceViewModel={gouvernanceViewModel} />
  )
}

type PageProps = Readonly<{
  params: Promise<Partial<Readonly<{
    codeDepartement: string
  }>>>
}>
