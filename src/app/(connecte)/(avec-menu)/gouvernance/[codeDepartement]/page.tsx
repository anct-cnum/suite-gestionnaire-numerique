'use client'

import { ReactElement, useContext } from 'react'

import Gouvernance from '@/components/Gouvernance/Gouvernance'
import { gouvernanceContext } from '@/components/shared/GouvernanceContext'

export default function GouvernanceController(): ReactElement {
  const { gouvernanceViewModel } = useContext(gouvernanceContext)
  return <Gouvernance gouvernanceViewModel={gouvernanceViewModel} />
}
