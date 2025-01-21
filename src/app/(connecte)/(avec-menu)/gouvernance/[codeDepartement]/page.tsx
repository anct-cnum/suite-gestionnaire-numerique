import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import Gouvernance from '@/components/Gouvernance/Gouvernance'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'

export default async function GouvernanceController({ params }: Props): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement
  const now = new Date()

  if (!codeDepartement) {
    notFound()
  }

  const gouvernanceReadModel =
    await new PrismaGouvernanceLoader(prisma.gouvernanceRecord).trouverEtEnrichir(codeDepartement)

  const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, now)

  return (
    <Gouvernance gouvernanceViewModel={gouvernanceViewModel} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
