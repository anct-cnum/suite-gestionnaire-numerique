import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export const metadata: Metadata = {
  title: 'Lieux d’inclusion',
}

export default function LieuxInclusionController(): ReactElement {
  return (
    <PageTitle>
      <TitleIcon icon="map-pin-2-line" />
      Lieux d’inclusion
    </PageTitle>
  )
}
