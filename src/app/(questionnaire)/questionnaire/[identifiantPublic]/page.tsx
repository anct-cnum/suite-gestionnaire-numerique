import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import QuestionnairePublic from '@/components/mesure-impact/QuestionnairePublic/QuestionnairePublic'
import { PrismaCampagneLoader } from '@/gateways/mesure-impact/PrismaCampagneLoader'
import { RecupererLaCampagnePublique } from '@/use-cases/mesure-impact/RecupererLaCampagnePublique'

// Pas de titre ici : chaque écran du questionnaire donne le sien
export const metadata: Metadata = {
  robots: { follow: false, index: false },
}

export default async function QuestionnaireController({ params }: Props): Promise<ReactElement> {
  const { identifiantPublic } = await params
  const campagne = await new RecupererLaCampagnePublique(new PrismaCampagneLoader(), new Date()).handle({
    identifiantPublic,
  })

  if (campagne === null) {
    notFound()
  }

  return <QuestionnairePublic viewModel={campagne} />
}

type Props = Readonly<{
  params: Promise<{ identifiantPublic: string }>
}>
