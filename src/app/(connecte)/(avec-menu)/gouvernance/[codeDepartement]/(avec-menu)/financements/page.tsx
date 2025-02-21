import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Financements',
}

export default function FinancementsController(): ReactElement {
  return (
    <PageTitle icon="pen-nib-line">
      Financements
    </PageTitle>
  )
}
