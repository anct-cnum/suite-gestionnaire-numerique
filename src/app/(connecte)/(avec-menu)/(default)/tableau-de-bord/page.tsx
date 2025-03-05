import { Metadata } from 'next'
import { ReactElement } from 'react'

import Notice from '@/components/shared/Notice/Notice'
import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBordPresenter'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default function TableauDeBordController(): ReactElement {
  const tableauDeBordViewModel = tableauDeBordPresenter()

  return (
    <>
      <Notice />
      <TableauDeBord tableauDeBordViewModel={tableauDeBordViewModel} />
    </>
  )
}
