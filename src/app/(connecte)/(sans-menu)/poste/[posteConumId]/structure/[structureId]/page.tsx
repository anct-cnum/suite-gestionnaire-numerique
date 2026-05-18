import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import Poste from '@/components/Poste/Poste'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { PrismaPosteConseillerNumeriqueDetailLoader } from '@/gateways/PrismaPosteConseillerNumeriqueDetailLoader'
import { posteConseillerNumeriqueDetailPresenter } from '@/presenters/posteConseillerNumeriqueDetailPresenter'

export const metadata: Metadata = {
  title: 'Détail du poste Conseiller Numérique',
}

export default async function PosteConseillerNumeriqueController({ params }: Props): Promise<ReactElement> {
  const { posteConumId, structureId } = await params

  if (!posteConumId || !structureId) {
    notFound()
  }

  const posteConumIdNumeric = Number.parseInt(posteConumId, 10)
  const structureIdNumeric = Number.parseInt(structureId, 10)

  if (Number.isNaN(posteConumIdNumeric) || Number.isNaN(structureIdNumeric)) {
    notFound()
  }

  const loader = new PrismaPosteConseillerNumeriqueDetailLoader()
  const readModel = await loader.get(posteConumIdNumeric, structureIdNumeric)
  const viewModel = posteConseillerNumeriqueDetailPresenter(readModel, new Date())

  const filAriane = (
    <FilAriane
      items={[
        { href: '/tableau-de-bord', label: 'Tableau de bord' },
        { href: '/postes-conseiller-numerique', label: 'Suivi des postes Conseiller Numérique' },
        { label: 'Détail du poste' },
      ]}
    />
  )

  if ('type' in viewModel) {
    return (
      <>
        {filAriane}
        <div className="fr-container fr-py-4w">
          <div className="fr-alert fr-alert--error">
            <p>{viewModel.message}</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      {filAriane}
      <Poste viewModel={viewModel} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      posteConumId: string
      structureId: string
    }>
  >
}>
