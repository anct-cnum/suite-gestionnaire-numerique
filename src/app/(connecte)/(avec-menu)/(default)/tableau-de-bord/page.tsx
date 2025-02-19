import { Metadata } from 'next'
import { ReactElement } from 'react'

import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBordPresenter'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default function TableauDeBordController(): ReactElement {
  const tableauDeBordViewModel = tableauDeBordPresenter()

  return (
    <TableauDeBord tableauDeBordViewModel={tableauDeBordViewModel} />
  )
}
