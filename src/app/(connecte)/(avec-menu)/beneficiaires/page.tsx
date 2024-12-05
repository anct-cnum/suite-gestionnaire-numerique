import { Metadata } from 'next'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Bénéficiaires',
}

export default function BeneficiairesController(): ReactElement {
  return (
    <Title icon="community-line">
      Bénéficiaires
    </Title>
  )
}
