import Link from 'next/link'
import { ReactElement } from 'react'

export default function Forbidden(): ReactElement {
  return (
    <div className="fr-container fr-pt-8w fr-pb-10w center">
      <div className="fr-grid-row fr-grid-row--center">
        <div className="fr-col-8 fr-col-md-4">
          <img alt="" className="fr-responsive-img" src="/illustration-403.png" />
        </div>
      </div>
      <h1 className="color-blue-france fr-mt-4w fr-mb-2w">Cette page ne vous est pas accessible</h1>
      <p className="color-grey fr-text--lg fr-mb-2w">
        Votre compte ne dispose pas des droits nécessaires pour la consulter. Vérifiez que vous êtes connecté avec le
        bon compte, ou demandez un accès à notre équipe.
      </p>
      <p className="color-grey fr-text--sm fr-mb-2w">Erreur 403</p>
      <Link
        className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-btn--icon-left fr-icon-arrow-left-s-line"
        href="/tableau-de-bord"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  )
}
