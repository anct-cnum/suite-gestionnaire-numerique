import { Metadata } from 'next'
import { ReactElement } from 'react'

import MesParametres from '@/components/MesParametres/MesParametres'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'

export const metadata: Metadata = {
  title: 'Mes paramètres',
}

export default function MesParametresController(): ReactElement {
  return (
    <>
      <FilAriane items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Mes paramètres' }]} />
      <MesParametres />
    </>
  )
}
