import { Metadata } from 'next'
import { ReactElement } from 'react'

import PolitiqueConfidentialite from '@/components/PolitiqueConfidentialite/PolitiqueConfidentialite'

export const metadata: Metadata = {
  description: 'Politique de confidentialité de la plateforme Mon inclusion numérique',
  title: 'Politique de confidentialité',
}

export default function PolitiqueConfidentialiteController(): ReactElement {
  return (
    <PolitiqueConfidentialite />
  )
}
