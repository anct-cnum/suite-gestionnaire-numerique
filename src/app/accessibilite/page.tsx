import { Metadata } from 'next'
import { ReactElement } from 'react'

import Accessibilite from '@/components/Accessibilite/Accessibilite'

const title = 'Déclaration d’accessibilité'
export const metadata: Metadata = {
  title,
}

export default function PageAccessibilite(): ReactElement {
  return (
    <Accessibilite />
  )
}
