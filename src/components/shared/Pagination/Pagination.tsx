'use client'

import { useSearchParams } from 'next/navigation'
import { ReactElement } from 'react'

import DernierePage from './DernierePage'
import Page from './Page'
import { fullUrl } from './pagination'
import PremierePage from './PremierePage'

export default function Pagination({ pageCourante, pathname, totalUtilisateurs }: PaginationProps): ReactElement {
  const searchParams = useSearchParams()
  const urlAvecParametres = fullUrl(pathname, searchParams)

  return (
    <nav
      aria-label="Pagination"
      className="fr-pagination"
    >
      <ol className="fr-pagination__list">
        <li>
          <PremierePage urlAvecParametres={urlAvecParametres} />
        </li>
        <Page
          nombreDeResultat={totalUtilisateurs}
          pageCourante={pageCourante}
          urlAvecParametres={urlAvecParametres}
        />
        <li>
          <DernierePage
            nombreDeResultat={totalUtilisateurs}
            urlAvecParametres={urlAvecParametres}
          />
        </li>
      </ol>
    </nav>
  )
}

type PaginationProps = Readonly<{
  pageCourante: number
  pathname: string
  totalUtilisateurs: number
}>
