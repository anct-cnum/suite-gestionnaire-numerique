import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Lieux d’inclusion',
}

export default function LieuxInclusionController(): ReactElement {
  return (
    <PageTitle icon="map-pin-2-line">
      Lieux d’inclusion
    </PageTitle>
  )
}
