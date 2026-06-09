import { Metadata } from 'next'
import Image from 'next/image'
import { ReactElement } from 'react'

import teaser from './teaser.png'
import Badge from '@/components/shared/Badge/Badge'
import PageTitle from '@/components/shared/PageTitle/PageTitle'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { nomDepartement } from '@/shared/urlHelpers'

export const metadata: Metadata = {
  title: 'Financements',
}

export default async function FinancementsController({ params }: Props): Promise<ReactElement> {
  const { codeDepartement } = await params
  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { label: 'Gouvernance' },
          { href: `/gouvernance/${codeDepartement}`, label: nomDepartement(codeDepartement) },
          { label: 'Financements' },
        ]}
      />
      <div className="center fr-mt-6w">
        <Badge color="new" icon={true}>
          à venir
        </Badge>
        <PageTitle margin="fr-mt-5w fr-h4">
          Suivez les demandes de financements et de conventionnement des membres de la gouvernance
        </PageTitle>
        <Image alt="" src={teaser} />
      </div>
    </>
  )
}

type Props = Readonly<{
  params: Promise<Readonly<{ codeDepartement: string }>>
}>
