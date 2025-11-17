import Link from 'next/link'
import { ReactElement } from 'react'

export default function FilAriane({ items }: FilArianeProps): ReactElement {
  return (
    <nav
      aria-label="vous êtes ici :"
      className="fr-breadcrumb"
      role="navigation"
    >
      <button
        aria-controls="breadcrumb-1"
        aria-expanded="false"
        className="fr-breadcrumb__button"
        type="button"
      >
        Voir le fil d&apos;Ariane
      </button>
      <div
        className="fr-collapse"
        id="breadcrumb-1"
      >
        <ol className="fr-breadcrumb__list">
          {items.map((item, index) => {
            const isLast = index === items.length - 1
            const hasHref = item.href !== undefined && item.href !== ''

            return (
              <li key={item.label}>
                {isLast || !hasHref ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className="fr-breadcrumb__link"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    className="fr-breadcrumb__link"
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    href={item.href!}
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}

type FilArianeItem = {
  href?: string
  label: string
}

type FilArianeProps = {
  readonly items: Array<FilArianeItem>
}
