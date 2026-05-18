import { Metadata } from 'next'
import { ReactElement } from 'react'

import PolitiqueConfidentialite from '@/components/PolitiqueConfidentialite/PolitiqueConfidentialite'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'

export const metadata: Metadata = {
  description: 'Politique de confidentialité de la plateforme Mon inclusion numérique',
  title: 'Politique de confidentialité',
}

export default function PolitiqueConfidentialiteController(): ReactElement {
  return (
    <>
      <FilAriane
        items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Politique de confidentialité' }]}
      />
      <PolitiqueConfidentialite />
    </>
  )
}
