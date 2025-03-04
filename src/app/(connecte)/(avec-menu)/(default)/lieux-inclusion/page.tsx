import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Lieux d’inclusion',
}

export default function LieuxInclusionController(): ReactElement {
  return (
    <div className="center fr-mt-6w">
      <Badge
        color="new"
        icon={true}
      >
        à venir
      </Badge>
      <PageTitle>
        Visualisez tous les lieux d’inclusion numérique sur votre territoire
      </PageTitle>
      <Image
        alt=""
        src={teaser}
      />
    </div>
  )
}
