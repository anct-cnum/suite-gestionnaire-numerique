import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export const metadata: Metadata = {
  title: 'Bénéficiaires',
}

export default function BeneficiairesController(): ReactElement {
  return (
    <PageTitle>
      <TitleIcon icon="community-line" />
      Bénéficiaires
    </PageTitle>
  )
}
