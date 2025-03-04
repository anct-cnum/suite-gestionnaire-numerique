import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import Icon from '@/components/shared/Icon/Icon'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs',
}

export default function AidantsEtMediateursController(): ReactElement {
  return (
    <div className="center fr-mt-6w">
      <Badge color="green-tilleul-verveine">
        <Icon
          classname="fr-text--lead"
          icon="flashlight-fill"
        />
        à venir
      </Badge>
      <PageTitle>
        Identifiez et suivez les aidants et médiateurs de l’inclusion numérique sur votre territoire
      </PageTitle>
      <Image
        alt=""
        src={teaser}
      />
    </div>
  )
}
