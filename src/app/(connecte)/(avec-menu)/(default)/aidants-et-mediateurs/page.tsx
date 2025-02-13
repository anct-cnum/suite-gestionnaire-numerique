import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs',
}

export default function AidantsEtMediateursController(): ReactElement {
  return (
    <PageTitle icon="group-line">
      Aidants et médiateurs
    </PageTitle>
  )
}
