import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import Icon from '@/components/shared/Icon/Icon'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Bénéficiaires',
}

export default function BeneficiairesController(): ReactElement {
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
        Suivez tous les bénéficiaires de financements sur votre territoire et le statut de leur convention
      </PageTitle>
      <Image
        alt=""
        src={teaser}
      />
    </div>
  )
}
