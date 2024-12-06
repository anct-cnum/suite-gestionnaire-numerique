import { Metadata } from 'next'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Export de données',
}

export default function ExportDeDonneesController(): ReactElement {
  return (
    <Title icon="download-line">
      Export de données
    </Title>
  )
}
