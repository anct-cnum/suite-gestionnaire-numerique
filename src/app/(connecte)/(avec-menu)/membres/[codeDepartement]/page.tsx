import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Membres from '@/components/Gouvernance/Membres/Membres'
import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Membres',
}

export default async function MembresController({ params }: Props): Promise<ReactElement> {
  if (!(await params).codeDepartement) {
    notFound()
  }

  return (
    <>
      <PageTitle icon="compass-3-line">
        Membres
      </PageTitle>
      <Membres />
    </>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    codeDepartement: string
  }>>
}>
