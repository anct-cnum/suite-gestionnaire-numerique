import { Metadata } from 'next'
import { ReactElement } from 'react'

import Gouvernance from '@/components/Gouvernance/Gouvernance'

export const metadata: Metadata = {
  title: 'Gouvernance',
}

export default function GouvernanceController(): ReactElement {
  return <Gouvernance />
}
