import { Metadata } from 'next'
import { ReactElement } from 'react'

import MentionsLegales from '@/components/MentionsLegales/MentionsLegales'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'

export const metadata: Metadata = {
  description: 'Informations légales de la plateforme Mon inclusion numérique',
  title: 'Mentions Légales',
}

export default function MentionsLegalesController(): ReactElement {
  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Mentions légales' }]} />
      <MentionsLegales />
    </>
  )
}
