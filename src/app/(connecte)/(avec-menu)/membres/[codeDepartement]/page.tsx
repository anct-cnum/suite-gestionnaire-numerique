import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Membres',
}

export default function MembresController({ params }: PageProps): ReactElement {
  if (params.codeDepartement === undefined) {
    notFound()
  }

  return (
    <Title icon="">
      Membres
    </Title>
  )
}

type PageProps = Readonly<{
  params: Partial<Readonly<{
    codeDepartement: string
  }>>
}>
