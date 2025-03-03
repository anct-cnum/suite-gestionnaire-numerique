import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export const metadata: Metadata = {
  title: 'Financements',
}

export default function FinancementsController(): ReactElement {
  return (
    <PageTitle>
      <TitleIcon icon="pen-nib-line" />
      Financements
    </PageTitle>
  )
}
