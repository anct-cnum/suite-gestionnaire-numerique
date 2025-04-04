import Link from 'next/link'
import { ReactElement } from 'react'

import { nombreDePage } from '@/presenters/paginationPresenter'

export default function DernierePage({
  nombreDeResultat,
  urlAvecParametres,
  utilisateursParPage,
}: Props): ReactElement {
  urlAvecParametres.searchParams.set('page', String(nombreDePage(nombreDeResultat, utilisateursParPage) - 1))

  return (
    <Link
      className="fr-pagination__link fr-pagination__link--last"
      href={urlAvecParametres}
    >
      Dernière page
    </Link>
  )
}

type Props = Readonly<{
  nombreDeResultat: number
  urlAvecParametres: URL
  utilisateursParPage: number
}>
