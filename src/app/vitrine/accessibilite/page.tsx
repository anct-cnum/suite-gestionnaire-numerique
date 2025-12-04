import { Metadata } from 'next'
import { ReactElement } from 'react'

import Accessibilite from '@/components/Accessibilite/Accessibilite'

export const metadata: Metadata = {
  description: 'Déclaration d\'accessibilité de la plateforme Inclusion Numérique. Conformité RGAA et engagement pour l\'accessibilité numérique.',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Déclaration d\'accessibilité - Inclusion Numérique',
}

export default function AccessibiliteController(): ReactElement {
  return (
    <Accessibilite />
  )
}
