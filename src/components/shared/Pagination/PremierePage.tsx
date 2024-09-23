import Link from 'next/link'
import { ReactElement } from 'react'

export default function PremierePage(): ReactElement {
  return (
    <Link
      className="fr-pagination__link fr-pagination__link--first"
      href="/mes-utilisateurs"
    >
      Première page
    </Link>
  )
}
