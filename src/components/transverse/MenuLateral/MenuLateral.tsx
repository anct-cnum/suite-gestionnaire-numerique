import Link from 'next/link'
import { ReactElement } from 'react'

export default function MenuLateral(): ReactElement {
  return (
    <nav
      aria-labelledby="fr-sidemenu-title"
      className="fr-sidemenu fr-pt-5w"
    >
      <ul className="fr-sidemenu__list">
        <li className="fr-sidemenu__item">
          <Link
            className="fr-sidemenu__link"
            href="/tableau-de-bord"
          >
            <span
              aria-hidden="true"
              className="fr-icon-dashboard-3-line fr-mr-1w"
            />
            {'Tableau de bord'}
          </Link>
        </li>
      </ul>
    </nav>
  )
}
