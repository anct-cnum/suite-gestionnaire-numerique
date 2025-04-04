import Link from 'next/link'
import { ReactElement } from 'react'

import PageTitle from '@/components/shared/PageTitle/PageTitle'

export default function ErrorPageController(): ReactElement {
  return (
    <main
      id="content"
    >
      <div className="fr-container">
        <div className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
          <div className="fr-py-0 fr-col-12 fr-col-md-6">
            <PageTitle>
              Utilisateur non autorisé
            </PageTitle>
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
            <Link
              className="fr-btn"
              href="/connexion"
            >
              Revenir à la page de connexion
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
