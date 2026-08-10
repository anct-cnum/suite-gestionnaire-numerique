import { Metadata } from 'next'
import { ReactElement } from 'react'

import MesInformationsPersonnelles from '@/components/MesInformationsPersonnelles/MesInformationsPersonnelles'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'
import { getSessionUtilisateurId } from '@/gateways/NextAuthAuthentificationGateway'
import { PrismaMesInformationsPersonnellesLoader } from '@/gateways/PrismaMesInformationsPersonnellesLoader'
import { mesInformationsPersonnellesPresenter } from '@/presenters/mesInformationsPersonnellesPresenter'

export const metadata: Metadata = {
  title: 'Mes informations personnelles',
}

export default async function MesInformationsPersonnellesController(): Promise<ReactElement> {
  const mesInformationsPersonnellesQuery = new PrismaMesInformationsPersonnellesLoader()
  const mesInformationsPersonnellesReadModel = await mesInformationsPersonnellesQuery.byUid(
    await getSessionUtilisateurId()
  )
  const mesInformationsPersonnellesViewModel = mesInformationsPersonnellesPresenter(
    mesInformationsPersonnellesReadModel
  )

  return (
    <>
      <FilAriane
        items={[{ href: '/tableau-de-bord', label: 'Tableau de bord' }, { label: 'Mes informations personnelles' }]}
      />
      <MesInformationsPersonnelles mesInformationsPersonnellesViewModel={mesInformationsPersonnellesViewModel} />
    </>
  )
}
