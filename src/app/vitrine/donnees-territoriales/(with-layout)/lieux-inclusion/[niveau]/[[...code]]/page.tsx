import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import LieuxInclusionVitrine from '@/components/vitrine/LieuxInclusion/LieuxInclusionVitrine'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'
import { generateTerritoireMetadata } from '@/shared/territoireMetadata'

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code, niveau } = await params
  const codeDepartement = code?.[0]

  return generateTerritoireMetadata(niveau, codeDepartement, {
    descriptionTemplate: 'Découvrez les lieux d\'inclusion numérique pour {territoire}. Statistiques sur les structures d\'accompagnement, médiathèques, France Services et tiers-lieux.',
    keywords: ['lieux inclusion numérique', 'structures accompagnement', 'médiathèques', 'France Services', 'tiers-lieux', 'médiation numérique'],
    titleTemplate: 'Lieux d\'inclusion numérique - {territoire} - Inclusion Numérique',
  })
}

export default async function LieuxInclusion({ params }: Props): Promise<ReactElement> {
  const { code, niveau } = await params

  // Validation : niveau doit être 'national' ou 'departement'
  if (niveau !== 'national' && niveau !== 'departement') {
    notFound()
  }

  // Validation : si niveau = 'departement', code est obligatoire
  if (niveau === 'departement' && (code === undefined || code.length === 0)) {
    notFound()
  }

  // Extraction du code département si présent
  const codeDepartement = niveau === 'departement' && code !== undefined ? code[0] : undefined

  // Charger les données
  const loader = new PrismaLieuxInclusionNumeriqueLoader()
  const readModel = codeDepartement === undefined
    ? await loader.getNational()
    : await loader.getDepartemental(codeDepartement)

  const viewModel = lieuxInclusionNumeriquePresenter(readModel)

  return <LieuxInclusionVitrine viewModel={viewModel} />
}

type Props = Readonly<{
  params: Promise<{
    code?: ReadonlyArray<string>
    niveau: string
  }>
}>
