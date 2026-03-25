import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ReactElement } from 'react'

import AjouterUnMembrePage from '@/components/GestionMembresGouvernance/AjouterUnMembrePage'

export const metadata: Metadata = {
  title: 'Ajouter un membre - Gouvernance',
}

export default async function Page({ params }: Props): Promise<ReactElement> {
  const codeDepartement = (await params).codeDepartement

  if (!codeDepartement) {
    notFound()
  }

  return <AjouterUnMembrePage codeDepartement={codeDepartement} />
}

type Props = Readonly<{
  params: Promise<
    Readonly<{
      codeDepartement: string
    }>
  >
}>
