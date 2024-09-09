import Link from 'next/link'
import { ReactElement } from 'react'

import { nombreDePage } from './pagination'

export default function DernierePage({ nombreDeResultat }: DernierePageProps): ReactElement {
  return (
    <Link
      className="fr-pagination__link fr-pagination__link--last"
      href={{
        pathname: '/mes-utilisateurs',
        query: {
          page: nombreDePage(nombreDeResultat) - 1,
        },
      }}
    >
      Dernière page
    </Link>
  )
}

type DernierePageProps = Readonly<{
  nombreDeResultat: number
}>
