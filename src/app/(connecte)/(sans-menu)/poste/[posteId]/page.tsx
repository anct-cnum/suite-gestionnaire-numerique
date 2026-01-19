import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Poste from '@/components/Poste/Poste'
import { PrismaPosteConseillerNumeriqueDetailLoader } from '@/gateways/PrismaPosteConseillerNumeriqueDetailLoader'
import { posteConseillerNumeriqueDetailPresenter } from '@/presenters/posteConseillerNumeriqueDetailPresenter'

export const metadata: Metadata = {
  title: 'Détail du poste Conseiller Numérique',
}

export default async function PosteConseillerNumeriqueController({ params }: Props): Promise<ReactElement> {
  const { posteId } = await params

  if (!posteId) {
    notFound()
  }

  const posteIdNumeric = Number.parseInt(posteId, 10)

  if (Number.isNaN(posteIdNumeric)) {
    notFound()
  }

  const loader = new PrismaPosteConseillerNumeriqueDetailLoader()
  const readModel = await loader.getById(posteIdNumeric)
  const viewModel = posteConseillerNumeriqueDetailPresenter(readModel, new Date())

  if ('type' in viewModel) {
    return (
      <div className="fr-container fr-py-4w">
        <div className="fr-alert fr-alert--error">
          <p>
            {viewModel.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <Poste viewModel={viewModel} />
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{
    posteId: string
  }>>
}>
