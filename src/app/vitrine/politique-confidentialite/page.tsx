import { Metadata } from 'next'
import { ReactElement } from 'react'

import PolitiqueConfidentialite from '@/components/PolitiqueConfidentialite/PolitiqueConfidentialite'

export const metadata: Metadata = {
  description: 'Politique de confidentialité de la plateforme Inclusion Numérique. Traitement des données personnelles et conformité RGPD.',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Politique de confidentialité - Inclusion Numérique',
}

export default function PolitiqueConfidentialiteController(): ReactElement {
  return (
    <PolitiqueConfidentialite />
  )
}
