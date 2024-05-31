import { Metadata } from 'next'
import Link from 'next/link'
import { ReactElement } from 'react'

import LienExterne from '@/components/shared/LienExterne/LienExterne'

export const metadata: Metadata = {
  title: 'Page non trouvée',
}

export default function NotFound(): ReactElement {
  return (
    <div className="fr-container">
      <div className="fr-my-7w fr-mt-md-12w fr-mb-md-10w fr-grid-row fr-grid-row--gutters fr-grid-row--middle fr-grid-row--center">
        <div className="fr-py-0 fr-col-12 fr-col-md-6">
          <h1>
            Page non trouvée
          </h1>
          <p className="fr-text--sm fr-mb-3w">
            Erreur 404
          </p>
          <p className="fr-text--lead fr-mb-3w">
            La page que vous cherchez est introuvable. Excusez-nous pour la gène occasionnée.
          </p>
          <p className="fr-text--sm fr-mb-5w">
            Si vous avez tapé l’adresse web dans le navigateur, vérifiez qu’elle est correcte.
            La page n’est peut-être plus disponible.
            <br />
            Dans ce cas, pour continuer votre visite vous pouvez consulter notre page d’accueil,
            ou effectuer une recherche avec notre moteur de recherche en haut de page.
            <br />
            Sinon contactez-nous pour que l’on puisse vous rediriger vers la bonne information.
          </p>
          <ul className="fr-btns-group fr-btns-group--inline-md">
            <li>
              <Link
                className="fr-btn"
                href="/"
              >
                Page d’accueil
              </Link>
            </li>
            <li>
              <LienExterne
                className="fr-btn fr-btn--secondary"
                href="https://aide.conseiller-numerique.gouv.fr/fr/"
                title="Contactez-nous"
              >
                Contactez-nous
              </LienExterne>
            </li>
          </ul>
        </div>
        <div className="fr-col-12 fr-col-md-3 fr-col-offset-md-1 fr-px-6w fr-px-md-0 fr-py-0">
          <svg
            aria-hidden="true"
            className="fr-responsive-img fr-artwork"
            height="200"
            viewBox="0 0 160 200"
            width="160"
            xmlns="http://www.w3.org/2000/svg"
          >
            <use
              className="fr-artwork-motif"
              href="pictos/ovoid.svg#artwork-motif"
            />
            <use
              className="fr-artwork-background"
              href="pictos/ovoid.svg#artwork-background"
            />
            <g transform="translate(40, 60)">
              <use
                className="fr-artwork-decorative"
                href="pictos/technical-error.svg#artwork-decorative"
              />
              <use
                className="fr-artwork-minor"
                href="pictos/technical-error.svg#artwork-minor"
              />
              <use
                className="fr-artwork-major"
                href="pictos/technical-error.svg#artwork-major"
              />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}
