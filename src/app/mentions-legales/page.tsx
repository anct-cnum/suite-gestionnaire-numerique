import { Metadata } from 'next'
import { ReactElement } from 'react'

import MentionsLegales from '@/components/MentionsLegales/MentionsLegales'

const title = 'Mentions Légales'
export const metadata: Metadata = {
  title,
}

export default function PageMentionsLegales(): ReactElement {
  return (
    <MentionsLegales />
  )
}
