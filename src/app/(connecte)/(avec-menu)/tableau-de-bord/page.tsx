import { Metadata } from 'next'
import { ReactElement } from 'react'

import Titre from '@/components/shared/Titre/Titre'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default function TableauDeBordController(): ReactElement {
  return (
    <Titre icon="dashboard-3-line">
      Tableau de bord
    </Titre>
  )
}
