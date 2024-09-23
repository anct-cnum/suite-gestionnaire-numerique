import { ReactElement } from 'react'

import DernierePage from './DernierePage'
import Page from './Page'
import PremierePage from './PremierePage'

export default function Pagination({ pageCourante, totalUtilisateurs }: PaginationProps): ReactElement {
  return (
    <nav
      aria-label="Pagination"
      className="fr-pagination"
    >
      <ol className="fr-pagination__list">
        <li>
          <PremierePage />
        </li>
        <Page
          nombreDeResultat={totalUtilisateurs}
          pageCourante={pageCourante}
        />
        <li>
          <DernierePage
            nombreDeResultat={totalUtilisateurs}
          />
        </li>
      </ol>
    </nav>
  )
}

type PaginationProps = Readonly<{
  pageCourante: number
  totalUtilisateurs: number
}>
