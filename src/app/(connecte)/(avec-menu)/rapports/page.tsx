import { Metadata } from 'next'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Rapports',
}

export default function RapportsController(): ReactElement {
  return (
    <Title icon="dashboard-3-line">
      Rapports
    </Title>
  )
}
