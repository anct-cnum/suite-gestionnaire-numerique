import Link from 'next/link'
import { ReactElement } from 'react'

import { pages } from './pagination'

export default function Page({ nombreDeResultat, pageCourante }: PageProps): ReadonlyArray<ReactElement> {
  return pages(nombreDeResultat, pageCourante).map((page): ReactElement => {
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

    const urlAvecParametres = new URL(window.location.href)
    urlAvecParametres.searchParams.set('page', String(page - 1))

    return (
      <li key={page}>
        <Link
          className="fr-pagination__link"
          href={urlAvecParametres}
          title={`Page ${page}`}
        >
          {page}
        </Link>
      </li>
    )
  })
}

type PageProps = Readonly<{
  nombreDeResultat: number
  pageCourante: number
}>
