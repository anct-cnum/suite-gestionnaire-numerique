import { Metadata } from 'next'
import { ReactElement } from 'react'

import MentionsLegales from '@/components/MentionsLegales/MentionsLegales'

export const metadata: Metadata = {
  title: 'Mentions Légales',
}

export default function MentionsLegalesController(): ReactElement {
  return (
    <MentionsLegales />
  )
}
