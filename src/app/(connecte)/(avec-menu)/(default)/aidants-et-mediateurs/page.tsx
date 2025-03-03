import { Metadata } from 'next'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'
import TitleIcon from '@/components/shared/TitleIcon/TitleIcon'

export const metadata: Metadata = {
  title: 'Aidants et médiateurs',
}

export default function AidantsEtMediateursController(): ReactElement {
  return (
    <PageTitle>
      <TitleIcon icon="group-line" />
      Aidants et médiateurs
    </PageTitle>
  )
}
