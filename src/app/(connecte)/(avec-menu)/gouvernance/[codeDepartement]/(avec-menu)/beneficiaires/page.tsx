import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Bénéficiaires',
}

export default function BeneficiairesController(): ReactElement {
  return (
    <div className="center fr-mt-6w">
      <Badge
        color="new"
        icon={true}
      >
        à venir
      </Badge>
      <PageTitle margin="fr-mt-5w fr-h4">
        Suivez tous les bénéficiaires de financements sur votre territoire et le statut de leur convention
      </PageTitle>
      <Image
        alt=""
        src={teaser}
      />
    </div>
  )
}
