import Link from 'next/link'
import { MouseEvent, ReactElement } from 'react'

export default function PremierePage({ onNavigation, urlAvecParametres }: Props): ReactElement {
  urlAvecParametres.searchParams.set('page', '1')

  return (
    <Link
      className="fr-pagination__link fr-pagination__link--first"
      href={urlAvecParametres}
      onClick={gererClicNavigation(onNavigation, urlAvecParametres)}
    >
      Première page
    </Link>
  )
}

// Quand onNavigation est fourni, la navigation est déléguée au parent (ex : transition avec loader).
export function gererClicNavigation(
  onNavigation: ((url: string) => void) | undefined,
  urlAvecParametres: URL
): ((event: MouseEvent<HTMLAnchorElement>) => void) | undefined {
  if (onNavigation === undefined) {
    return undefined
  }
  const url = `${urlAvecParametres.pathname}${urlAvecParametres.search}`

  return (event: MouseEvent<HTMLAnchorElement>): void => {
    event.preventDefault()
    onNavigation(url)
  }
}

type Props = Readonly<{
  onNavigation?(url: string): void
  urlAvecParametres: URL
}>
