import { Metadata } from 'next'
import { ReactElement } from 'react'

import MentionsLegales from '@/components/MentionsLegales/MentionsLegales'

export const metadata: Metadata = {
  description: 'Informations légales de la plateforme Mon inclusion numérique',
  title: 'Mentions Légales',
}

export default function MentionsLegalesController(): ReactElement {
  return (
    <MentionsLegales />
  )
}
