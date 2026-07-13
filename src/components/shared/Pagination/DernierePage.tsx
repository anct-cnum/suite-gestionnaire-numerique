import Link from 'next/link'
import { ReactElement } from 'react'

import { gererClicNavigation } from './PremierePage'
import { nombreDePage } from '@/presenters/paginationPresenter'

export default function DernierePage({
  nombreDeResultat,
  onNavigation,
  urlAvecParametres,
  utilisateursParPage,
}: Props): ReactElement {
  urlAvecParametres.searchParams.set('page', String(nombreDePage(nombreDeResultat, utilisateursParPage)))

  return (
    <Link
      className="fr-pagination__link fr-pagination__link--last"
      href={urlAvecParametres}
      onClick={gererClicNavigation(onNavigation, urlAvecParametres)}
    >
      Dernière page
    </Link>
  )
}

type Props = Readonly<{
  nombreDeResultat: number
  onNavigation?(url: string): void
  urlAvecParametres: URL
  utilisateursParPage: number
}>
