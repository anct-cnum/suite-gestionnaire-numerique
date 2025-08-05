import { Metadata } from 'next'
import { ReactElement } from 'react'

import LieuxInclusion from '@/components/LieuxInclusion/LieuxInclusion'

export const metadata: Metadata = {
  title: 'Lieux d’inclusion',
}

export default function LieuxInclusionController(): ReactElement {
  return (<LieuxInclusion />)
}
