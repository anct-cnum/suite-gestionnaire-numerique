import Link from 'next/link'
import { ReactElement } from 'react'

import { nombreDePage } from './pagination'

export default function DernierePage({ nombreDeResultat }: DernierePageProps): ReactElement {
  const urlAvecParametres = new URL(window.location.href)
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
}>
