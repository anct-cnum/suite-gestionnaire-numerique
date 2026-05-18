import { Metadata } from 'next'
import { ReactElement } from 'react'

import Accessibilite from '@/components/Accessibilite/Accessibilite'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'

export const metadata: Metadata = {
  description: "Déclaration d'accessibilité de la plateforme Mon inclusion numérique",
  title: "Déclaration d'accessibilité",
}

export default function AccessibiliteController(): ReactElement {
  return (
    <>
      <FilAriane
        items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: "Déclaration d'accessibilité" }]}
      />
      <Accessibilite />
    </>
  )
}
