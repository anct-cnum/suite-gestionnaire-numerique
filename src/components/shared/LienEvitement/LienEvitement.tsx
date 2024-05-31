import { ReactElement } from 'react'

import '@gouvfr/dsfr/dist/component/skiplink/skiplink.min.css'

export default function LienEvitement(): ReactElement {
  return (
    <div className="fr-skiplinks">
      <nav
        aria-label="Accès rapide"
        className="fr-container"
      >
        <ul className="fr-skiplinks__list">
          <li>
            <a
              className="fr-link"
              href="#content"
            >
              Contenu
            </a>
          </li>
          <li>
            <a
              className="fr-link"
              href="#header-navigation"
            >
              Menu
            </a>
          </li>
          <li>
            <a
              className="fr-link"
              href="#footer"
            >
              Pied de page
            </a>
          </li>
        </ul>
      </nav>
    </div>
  )
}
