import { Metadata } from 'next'
import { ReactElement } from 'react'

import MesInformationsPersonnelles from '@/components/MesInformationsPersonnelles/MesInformationsPersonnelles'
import { InMemoryMesInformationsPersonnellesQuery } from '@/gateways/InMemoryMesInformationsPersonnellesQuery'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'

const title = 'Mes informations personnelles'
export const metadata: Metadata = {
  title,
}

export default async function PageMesInformationsPersonnelles(): Promise<ReactElement> {
  const mesInformationsPersonnellesQuery = new InMemoryMesInformationsPersonnellesQuery()
  const mesInformationsPersonnelles =
    await mesInformationsPersonnellesQuery.retrieveMesInformationsPersonnelles()
  const presenter = mesInformationsPersonnellesPresenter(mesInformationsPersonnelles)

  return (
    <MesInformationsPersonnelles presenter={presenter} />
  )
}
