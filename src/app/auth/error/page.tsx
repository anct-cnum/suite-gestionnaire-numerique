import Link from 'next/link'
import { ReactElement } from 'react'

export default function ErrorPageController(): ReactElement {
  return (
    <main
      id="content"
      role="main"
    >
      <div className="fr-container">
        <div className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
          <div className="fr-py-0 fr-col-12 fr-col-md-6">
            <h1>
              Utilisateur non autorisé
            </h1>
            <p className="fr-text--sm fr-mb-3w">
              Erreur 403
            </p>
            <p className="fr-text--lead fr-mb-3w">
              Vous n‘avez pas les droits nécessaires pour accéder à cette page.
            </p>
            <p className="fr-text--sm fr-mb-5w">
              Si vous pensez qu‘il s‘agit d‘une erreur,
              veuillez vérifier que vous êtes connecté avec le bon compte.
            </p>
            <ul className="fr-btns-group fr-btns-group--inline-md">
              <li>
                <Link
                  className="fr-btn"
                  href="/connexion"
                >
                  Revenir à la page de connexion
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </main>
  )
}
