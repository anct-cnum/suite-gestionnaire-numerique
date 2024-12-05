import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Title from '@/components/shared/Title/Title'

export const metadata: Metadata = {
  title: 'Feuilles de route',
}

export default function FeuillesDeRouteController({ params }: PageProps): ReactElement {
  if (params.codeDepartement === undefined) {
    notFound()
  }

  return (
    <Title icon="">
      Feuilles de route
    </Title>
  )
}

type PageProps = Readonly<{
  params: Partial<Readonly<{
    codeDepartement: string
  }>>
}>
