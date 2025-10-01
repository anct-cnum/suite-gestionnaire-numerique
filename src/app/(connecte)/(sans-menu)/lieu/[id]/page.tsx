import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import LieuxInclusionDetails from '@/components/LieuInclusionDetails/LieuInclusionDetails'
import { PrismaRecupererLieuDetailsLoader } from '@/gateways/PrismaRecupererLieuDetailsLoader'
import { lieuDetailsPresenter } from '@/presenters/LieuDetailsPresenter'

export const metadata: Metadata = {
  title: 'Détails du lieu d\'inclusion ',
}

async function LieuPage({ params }: Props) : Promise<ReactElement>{
  const { id } = await params

  const loader = new PrismaRecupererLieuDetailsLoader()
  const lieuDetailsReadModel = await loader.recuperer(id)

  const presentedData = lieuDetailsPresenter(lieuDetailsReadModel)

  if (!presentedData) {
    notFound()
  }

  return (
    <LieuxInclusionDetails data={presentedData} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    id: string
  }>>
}>

export default LieuPage
