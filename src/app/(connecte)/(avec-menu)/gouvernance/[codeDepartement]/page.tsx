import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../prisma/prismaClient'
import Gouvernance from '@/components/Gouvernance/Gouvernance'
import { PrismaGouvernanceLoader } from '@/gateways/PrismaGouvernanceLoader'
import { gouvernancePresenter } from '@/presenters/gouvernancePresenter'
import { RecupererUneGouvernance } from '@/use-cases/queries/RecupererUneGouvernance'

export default async function GouvernanceController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const gouvernanceReadModel = await
    new RecupererUneGouvernance(new PrismaGouvernanceLoader(prisma.gouvernanceRecord)).handle({ codeDepartement })

    const gouvernanceViewModel = gouvernancePresenter(gouvernanceReadModel, new Date())
    return (
      <Gouvernance gouvernanceViewModel={gouvernanceViewModel} />
    )
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
