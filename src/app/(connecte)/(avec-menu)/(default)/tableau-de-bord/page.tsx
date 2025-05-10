import { Metadata } from 'next'
import { ReactElement } from 'react'

import Notice from '@/components/shared/Notice/Notice'
import TableauDeBord from '@/components/TableauDeBord/TableauDeBord'
import { indiceFragilitePresenter } from '@/presenters/indiceFragilitePresenter'
import { tableauDeBordPresenter } from '@/presenters/tableauDeBordPresenter'

export const metadata: Metadata = {
  title: 'Mon tableau de bord',
}

export default function TableauDeBordController(): ReactElement {
  const tableauDeBordViewModel = tableauDeBordPresenter()
  const communeFragilite = indiceFragilitePresenter('69')
  console.log(communeFragilite)
  return (
    <>
      <Notice />
      <TableauDeBord
        communeFragilite={communeFragilite}
        tableauDeBordViewModel={tableauDeBordViewModel}
      />
    </>
  )
}
