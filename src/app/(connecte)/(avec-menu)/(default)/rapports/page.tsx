import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Rapports',
}

export default function RapportsController(): ReactElement {
  return (
    <PageTitle icon="dashboard-3-line">
      Rapports
    </PageTitle>
  )
}
