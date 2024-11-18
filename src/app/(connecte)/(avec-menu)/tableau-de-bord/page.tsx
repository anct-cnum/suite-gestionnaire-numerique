import { Metadata } from 'next'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default function TableauDeBordController(): ReactElement {
  return (
    <Title icon="dashboard-3-line">
      Tableau de bord
    </Title>
  )
}
