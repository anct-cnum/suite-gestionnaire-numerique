import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUnMembrePage from '@/components/GestionMembresGouvernance/AjouterUnMembrePage'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { nomDepartement } from '@/shared/urlHelpers'

export const metadata: Metadata = {
  title: 'Ajouter un membre - Gouvernance',
}

export default async function Page({ params }: Props): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement

  if (!codeDepartement) {
    notFound()
  }

  return (
    <>
      <FilAriane
        items={[
          { href: '/tableau-de-bord', label: 'Tableau de bord' },
          { href: `/gouvernance/${codeDepartement}`, label: `Gouvernance ${nomDepartement(codeDepartement)}` },
          { href: `/gouvernance/${codeDepartement}/membres`, label: 'Membres' },
          { label: 'Ajouter un membre' },
        ]}
      />
      <AjouterUnMembrePage codeDepartement={codeDepartement} />
    </>
  )
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      codeDepartement: string
    }>
  >
}>
