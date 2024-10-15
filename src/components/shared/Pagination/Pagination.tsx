'use client'

import { ReactElement, useContext } from 'react'

import DernierePage from './DernierePage'
import Page from './Page'
import { fullUrl } from './pagination'
import PremierePage from './PremierePage'
import { clientContext } from '../ClientContext'

export default function Pagination({ pageCourante, pathname, totalUtilisateurs }: PaginationProps): ReactElement {
  const { searchParams, utilisateursParPage } = useContext(clientContext)
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
          utilisateursParPage={utilisateursParPage}
        />
        <li>
          <DernierePage
            nombreDeResultat={totalUtilisateurs}
            urlAvecParametres={urlAvecParametres}
            utilisateursParPage={utilisateursParPage}
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
