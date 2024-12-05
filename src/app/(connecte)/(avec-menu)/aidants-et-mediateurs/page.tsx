import { Metadata } from 'next'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs',
}

export default function AidantsEtMediateursController(): ReactElement {
  return (
    <Title icon="group-line">
      Aidants et médiateurs
    </Title>
  )
}
