import { Metadata } from 'next'
import { ReactElement } from 'react'

import MesParametres from '@/components/MesParametres/MesParametres'

export const metadata: Metadata = {
  title: 'Mes paramètres',
}

export default function MesParametresController(): ReactElement {
  return (
    <MesParametres />
  )
}
