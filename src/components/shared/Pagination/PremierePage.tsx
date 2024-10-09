import Link from 'next/link'
import { ReactElement } from 'react'

export default function PremierePage({ urlAvecParametres }: PremierePageProps): ReactElement {
  urlAvecParametres.searchParams.delete('page')

  return (
    <Link
      className="fr-pagination__link fr-pagination__link--first"
      href={urlAvecParametres}
    >
      Première page
    </Link>
  )
}

type PremierePageProps = Readonly<{
  urlAvecParametres: URL
}>
