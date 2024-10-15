'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import { nombreDePage } from './calculPagination'

export default function DernierePage({
  nombreDeResultat,
  urlAvecParametres,
  utilisateursParPage,
}: DernierePageProps): ReactElement {
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

type DernierePageProps = Readonly<{
  nombreDeResultat: number
  urlAvecParametres: URL
  utilisateursParPage: number
}>
