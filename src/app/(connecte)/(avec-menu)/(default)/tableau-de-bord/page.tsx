import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default function TableauDeBordController(): ReactElement {
  return (
    <PageTitle icon="dashboard-3-line">
      Tableau de bord
    </PageTitle>
  )
}
