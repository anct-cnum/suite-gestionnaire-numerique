import Link from 'next/link'
import { ReactElement } from 'react'

import { pages } from '@/presenters/paginationPresenter'

export default function Page({
  nombreDeResultat,
  pageCourante,
  urlAvecParametres,
  utilisateursParPage,
}: Props): ReadonlyArray<ReactElement> {
  return pages(nombreDeResultat, pageCourante, utilisateursParPage).map((page): ReactElement => {
    if (pageCourante === page - 1) {
      return (
        <li key={page}>
          <Link
            aria-current="page"
            className="fr-pagination__link"
            href="#"
            title={`Page ${page}`}
          >
            {page}
          </Link>
        </li>
      )
    }

    const cloneUrlAvecParametres = new URL(urlAvecParametres)
    cloneUrlAvecParametres.searchParams.set('page', String(page - 1))

    return (
      <li key={page}>
        <Link
          className="fr-pagination__link"
          href={cloneUrlAvecParametres}
          title={`Page ${page}`}
        >
          {page}
        </Link>
      </li>
    )
  })
}

type Props = Readonly<{
  nombreDeResultat: number
  pageCourante: number
  urlAvecParametres: URL
  utilisateursParPage: number
}>
