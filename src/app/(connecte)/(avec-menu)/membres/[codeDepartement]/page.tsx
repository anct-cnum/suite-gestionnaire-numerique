import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export const metadata: Metadata = {
  title: 'Membres',
}

export default async function MembresController({ params }: PageProps): Promise<ReactElement> {
  if ((await params).codeDepartement === undefined) {
    notFound()
  }

  return (
    <PageTitle icon="compass-3-line">
      Membres
    </PageTitle>
  )
}

type PageProps = Readonly<{
  params: Promise<Partial<Readonly<{
    codeDepartement: string
  }>>>
}>
