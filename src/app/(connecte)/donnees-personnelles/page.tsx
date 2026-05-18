import { Metadata } from 'next'
import { ReactElement } from 'react'

import DonneesPersonnelles from '@/components/DonneesPersonnelles/DonneesPersonnelles'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'

export const metadata: Metadata = {
  title: 'Données personnelles',
}

export default function DonneesPersonnellesController(): ReactElement {
  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Données personnelles' }]} />
      <DonneesPersonnelles />
    </>
  )
}
