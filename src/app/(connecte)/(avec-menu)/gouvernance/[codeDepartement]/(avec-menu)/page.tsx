import { Metadata } from 'next'
import { ReactElement } from 'react'

import Gouvernance from '@/components/Gouvernance/Gouvernance'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { nomDepartement } from '@/shared/urlHelpers'

export const metadata: Metadata = {
  title: 'Gouvernance',
}

export default async function GouvernanceController({ params }: Props): Promise<ReactElement> {
  const { codeDepartement } = await params
  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: '/gouvernances', label: 'Gouvernances' },
          { label: nomDepartement(codeDepartement) },
        ]}
      />
      <Gouvernance />
    </>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{ codeDepartement: string }>>
}>
