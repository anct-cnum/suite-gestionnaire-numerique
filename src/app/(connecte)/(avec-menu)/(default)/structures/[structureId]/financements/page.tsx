import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Financements',
}

export default async function FinancementsStructureController({ params }: Props): Promise<ReactElement> {
  await params
  return (
    <div className="center fr-mt-6w">
      <Badge color="new" icon={true}>
        à venir
      </Badge>
      <PageTitle margin="fr-mt-5w fr-h4">Suivez les demandes de financements de votre structure</PageTitle>
      <Image alt="" src={teaser} />
    </div>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{ structureId: string }>>
}>
