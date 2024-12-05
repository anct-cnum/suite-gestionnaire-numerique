import { Metadata } from 'next'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Financements',
}

export default function FinancementsController(): ReactElement {
  return (
    <Title icon="pen-nib-line">
      Financements
    </Title>
  )
}
