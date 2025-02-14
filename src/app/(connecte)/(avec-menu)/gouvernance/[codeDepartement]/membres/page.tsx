import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import prisma from '../../../../../../../prisma/prismaClient'
import Membres from '@/components/Gouvernance/Membres/Membres'
import { PrismaMesMembresLoader } from '@/gateways/PrismaMesMembresLoader'
import { mesMembresPresenter } from '@/presenters/mesMembresPresenter'
import { RecupererMesMembres } from '@/use-cases/queries/RecupererMesMembres'

export const metadata: Metadata = {
  title: 'Membres',
}

export default async function MembresController({ params }: Props): Promise<ReactElement> {
  try {
    const codeDepartement = (await params).codeDepartement
    const membresViewModel = await new RecupererMesMembres(new PrismaMesMembresLoader(prisma.gouvernanceRecord))
      .handle({ codeDepartement })
    return <Membres membresViewModel={mesMembresPresenter(membresViewModel)} />
  } catch {
    notFound()
  }
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
