import { Metadata } from 'next'
import { ReactElement } from 'react'

import MesInformationsPersonnelles from '@/components/MesInformationsPersonnelles/MesInformationsPersonnelles'
import { InMemoryMesInformationsPersonnellesQuery } from '@/gateways/InMemoryMesInformationsPersonnellesQuery'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'

export const metadata: Metadata = {
  title: 'Mes informations personnelles',
}

export default async function MesInformationsPersonnellesController(): Promise<ReactElement> {
  const mesInformationsPersonnellesQuery = new InMemoryMesInformationsPersonnellesQuery()
  const mesInformationsPersonnelles =
    await mesInformationsPersonnellesQuery.retrieveMesInformationsPersonnelles()
  const mesInformationsPersonnellesViewModel = mesInformationsPersonnellesPresenter(mesInformationsPersonnelles)

  return (
    <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
  )
}
