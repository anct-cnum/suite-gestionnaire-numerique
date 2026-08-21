import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import { recupererTerritoireVitrine, TerritoireVitrine } from '../../../../territoire'
import LieuxInclusionVitrine from '@/components/vitrine/LieuxInclusion/LieuxInclusionVitrine'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const territoire = await recupererTerritoireVitrine(niveau, code?.[0])

  return generateTerritoireMetadata(
    niveau,
    code?.[0],
    {
      descriptionTemplate:
        "Découvrez les lieux d'inclusion numérique pour {territoire}. Statistiques sur les structures d'accompagnement, médiathèques, France Services et tiers-lieux.",
      keywords: [
        'lieux inclusion numérique',
        'structures accompagnement',
        'médiathèques',
        'France Services',
        'tiers-lieux',
        'médiation numérique',
      ],
      titleTemplate: "Lieux d'inclusion numérique - {territoire} - Inclusion Numérique",
    },
    territoire !== null && (territoire.type === 'region' || territoire.type === 'epci') ? territoire.nom : undefined
  )
}

export default async function LieuxInclusion({ params }: Props): Promise<ReactElement> {
  const { code, niveau } = await params

  const territoire = await recupererTerritoireVitrine(niveau, code?.[0])
  if (territoire === null) {
    notFound()
  }

  const readModel = await chargerLesLieux(territoire)
  const viewModel = lieuxInclusionNumeriquePresenter(readModel)

  return <LieuxInclusionVitrine viewModel={viewModel} />
}

async function chargerLesLieux(
  territoire: TerritoireVitrine
): ReturnType<PrismaLieuxInclusionNumeriqueLoader['getNational']> {
  const loader = new PrismaLieuxInclusionNumeriqueLoader()
  switch (territoire.type) {
    case 'departement':
      return loader.getDepartemental(territoire.code)
    case 'epci':
      return loader.getParCommunes(territoire.codesInsee)
    case 'national':
      return loader.getNational()
    case 'region':
      return loader.getDepartementaux(territoire.codesDepartement)
  }
}

type Props = Readonly<{
  params: Promise<{
    code?: ReadonlyArray<string>
    niveau: string
  }>
}>
