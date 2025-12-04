import { Metadata } from 'next'
import { ReactElement } from 'react'

import MentionsLegales from '@/components/MentionsLegales/MentionsLegales'

export const metadata: Metadata = {
  description: 'Mentions légales de la plateforme Inclusion Numérique. Éditeur, hébergement, propriété intellectuelle et informations de contact.',
  robots: {
    follow: false,
    index: false,
  },
  title: 'Mentions légales - Inclusion Numérique',
}

export default function MentionsLegalesController(): ReactElement {
  return (
    <MentionsLegales />
  )
}
