import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export const metadata: Metadata = {
  title: 'Export de données',
}

export default function ExportDeDonneesController(): ReactElement {
  return (
    <PageTitle>
      <TitleIcon icon="download-line" />
      Export de données
    </PageTitle>
  )
}
