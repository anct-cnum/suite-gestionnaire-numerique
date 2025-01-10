import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Gouvernance from '@/components/Gouvernance/Gouvernance'
import { gouvernanceVideViewModel } from '@/presenters/gouvernancePresenter'

export const metadata: Metadata = {
  title: 'Gouvernance vide',
}

export default async function GouvernanceVideController({ params }: Props): Promise<ReactElement> {
  if (!(await params).codeDepartement) {
    notFound()
  }

  return (
    <Gouvernance gouvernanceViewModel={gouvernanceVideViewModel} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
