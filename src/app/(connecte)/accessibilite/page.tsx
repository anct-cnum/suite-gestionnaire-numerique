import { Metadata } from 'next'
import { ReactElement } from 'react'

import Accessibilite from '@/components/Accessibilite/Accessibilite'

export const metadata: Metadata = {
  title: 'Déclaration d’accessibilité',
}

export default function AccessibiliteController(): ReactElement {
  return (
    <Accessibilite />
  )
}
