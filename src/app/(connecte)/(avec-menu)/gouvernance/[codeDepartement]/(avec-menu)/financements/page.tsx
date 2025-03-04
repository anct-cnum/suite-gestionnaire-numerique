import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Financements',
}

export default function FinancementsController(): ReactElement {
  return (
    <div className="center fr-mt-6w">
      <Badge
        color="new"
        icon={true}
      >
        à venir
      </Badge>
      <PageTitle>
        Suivez les demandes de financements et de conventionnement des membres de la gouvernance
      </PageTitle>
      <Image
        alt=""
        src={teaser}
      />
    </div>
  )
}
