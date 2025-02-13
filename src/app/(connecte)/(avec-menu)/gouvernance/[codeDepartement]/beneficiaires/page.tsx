import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Bénéficiaires',
}

export default function BeneficiairesController(): ReactElement {
  return (
    <PageTitle icon="community-line">
      Bénéficiaires
    </PageTitle>
  )
}
