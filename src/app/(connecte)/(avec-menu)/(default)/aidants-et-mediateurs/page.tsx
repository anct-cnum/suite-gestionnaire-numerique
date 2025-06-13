import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs',
}

export default function AidantsEtMediateursController(): ReactElement {
  return (
    <div className="center fr-mt-6w">
      <Badge
        color="new"
        icon={true}
      >
        à venir
      </Badge>
      <PageTitle margin="fr-mt-5w fr-h4">
        Identifiez et suivez les aidants et médiateurs de l&apos;inclusion numérique sur votre territoire
      </PageTitle>
      <Image
        alt=""
        src={teaser}
      />
    </div>
  )
}
