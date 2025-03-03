import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export const metadata: Metadata = {
  title: 'Rapports',
}

export default function RapportsController(): ReactElement {
  return (
    <PageTitle>
      <TitleIcon icon="dashboard-3-line" />
      Rapports
    </PageTitle>
  )
}
