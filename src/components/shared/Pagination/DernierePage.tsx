import Link from 'next/link'
import { ReactElement } from 'react'

import { nombreDePage } from './pagination'

export default function DernierePage({ nombreDeResultat, urlAvecParametres }: DernierePageProps): ReactElement {
  urlAvecParametres.searchParams.set('page', String(nombreDePage(nombreDeResultat) - 1))

  return (
    <Link
      className="fr-pagination__link fr-pagination__link--last"
      href={urlAvecParametres}
    >
      Dernière page
    </Link>
  )
}

type DernierePageProps = Readonly<{
  nombreDeResultat: number
  urlAvecParametres: URL
}>
