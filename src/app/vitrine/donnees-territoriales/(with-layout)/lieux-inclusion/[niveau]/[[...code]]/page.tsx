import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import LieuxInclusionVitrine from '@/components/vitrine/LieuxInclusion/LieuxInclusionVitrine'
import { PrismaLieuxInclusionNumeriqueLoader } from '@/gateways/PrismaLieuxInclusionNumeriqueLoader'
import { lieuxInclusionNumeriquePresenter } from '@/presenters/lieuxInclusionNumeriquePresenter'

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
