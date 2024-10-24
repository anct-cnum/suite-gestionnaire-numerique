'use client'

import { ReactElement, useContext } from 'react'

import DernierePage from './DernierePage'
import Page from './Page'
import PremierePage from './PremierePage'
import { fullUrl } from '../../../presenters/paginationPresenter'
import { clientContext } from '../ClientContext'

export default function Pagination({ pathname, totalUtilisateurs }: PaginationProps): ReactElement {
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
          pageCourante={Number(searchParams.get('page') ?? 0)}
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
  pathname: string
  totalUtilisateurs: number
}>
