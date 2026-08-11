import { Metadata } from 'next'
import { ReactElement } from 'react'

import LabellisationEtape2 from '@/components/Label/LabellisationEtape2'

export const metadata: Metadata = {
  title: 'Attestation sur l’honneur',
}

export default function AttestationController(): ReactElement {
  return <LabellisationEtape2 />
}
