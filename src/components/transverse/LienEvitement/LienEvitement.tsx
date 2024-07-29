import { ReactElement } from 'react'

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
              href="#menuUtilisateur"
            >
              Menu utilisateur
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
