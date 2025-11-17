import { Metadata } from 'next'
import { ReactElement } from 'react'

import Accessibilite from '@/components/Accessibilite/Accessibilite'

export const metadata: Metadata = {
  description: 'Déclaration d\'accessibilité de la plateforme Mon inclusion numérique',
  title: 'Déclaration d\'accessibilité',
}

export default function AccessibiliteController(): ReactElement {
  return (
    <Accessibilite />
  )
}
