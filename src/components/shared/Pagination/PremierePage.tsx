import Link from 'next/link'
import { ReactElement } from 'react'

export default function PremierePage({ urlAvecParametres }: Props): ReactElement {
  urlAvecParametres.searchParams.set('page', '1')

  return (
    <Link
      className="fr-pagination__link fr-pagination__link--first"
      href={urlAvecParametres}
    >
      Première page
    </Link>
  )
}

type Props = Readonly<{
  urlAvecParametres: URL
}>
