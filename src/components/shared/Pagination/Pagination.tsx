'use client'

import { ReactElement, useContext } from 'react'

import DernierePage from './DernierePage'
import Page from './Page'
import PremierePage from './PremierePage'
import { clientContext } from '../ClientContext'
import { fullUrl } from '@/presenters/paginationPresenter'

export default function Pagination({ onNavigation, pathname, totalUtilisateurs }: Props): ReactElement {
  const { searchParams, utilisateursParPage } = useContext(clientContext)
  const urlAvecParametres = fullUrl(pathname, searchParams)

  return (
    <nav aria-label="Pagination" className="fr-pagination">
      <ol className="fr-pagination__list">
        <li>
          <PremierePage onNavigation={onNavigation} urlAvecParametres={urlAvecParametres} />
        </li>
        <Page
          nombreDeResultat={totalUtilisateurs}
          onNavigation={onNavigation}
          pageCourante={Number(searchParams.get('page') ?? 1)}
          urlAvecParametres={urlAvecParametres}
          utilisateursParPage={utilisateursParPage}
        />
        <li>
          <DernierePage
            nombreDeResultat={totalUtilisateurs}
            onNavigation={onNavigation}
            urlAvecParametres={urlAvecParametres}
            utilisateursParPage={utilisateursParPage}
          />
        </li>
      </ol>
    </nav>
  )
}

type Props = Readonly<{
  onNavigation?(url: string): void
  pathname: string
  totalUtilisateurs: number
}>
