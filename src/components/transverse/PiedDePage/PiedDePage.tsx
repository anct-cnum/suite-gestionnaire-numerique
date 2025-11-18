import Link from 'next/link'
import { ReactElement } from 'react'

import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'

export default function PiedDePage(): ReactElement {
  return (
    <footer
      className="fr-footer"
      id="footer"
    >
      <div className="fr-container">
        <div className="fr-footer__body">
          <div className="fr-footer__brand fr-enlarge-link">
            <Link
              href="/tableau-de-bord"
              title="Accueil"
            >
              <p className="fr-logo">
                République
                <br />
                Française
              </p>
            </Link>
            <ExternalLink
              className="fr-footer__brand-link"
              href="https://anct.gouv.fr/"
              title="Page d'accueil - ANCT - Agence Nationale de la Cohésion des Territoires - République Française"
            >
              <img
                alt="Logo ANCT"
                src="/anct-texte.svg"
                style={{
                  display: 'block',
                  marginLeft: '8px',
                  maxHeight: '90px',
                  maxWidth: '100%',
                  paddingLeft: '32px',
                  verticalAlign: 'middle',
                }}
              />
            </ExternalLink>
          </div>
          <div className="fr-footer__content">
            <ul className="fr-footer__content-list">
              <li className="fr-footer__content-item">
                <ExternalLink
                  className="fr-footer__content-link"
                  href="https://legifrance.gouv.fr"
                  title="legifrance.gouv.fr"
                >
                  legifrance.gouv.fr
                </ExternalLink>
              </li>
              <li className="fr-footer__content-item">
                <ExternalLink
                  className="fr-footer__content-link"
                  href="https://gouvernement.fr"
                  title="gouvernement.fr"
                >
                  gouvernement.fr
                </ExternalLink>
              </li>
              <li className="fr-footer__content-item">
                <ExternalLink
                  className="fr-footer__content-link"
                  href="https://service-public.fr"
                  title="service-public.fr"
                >
                  service-public.fr
                </ExternalLink>
              </li>
              <li className="fr-footer__content-item">
                <ExternalLink
                  className="fr-footer__content-link"
                  href="https://data.gouv.fr"
                  title="data.gouv.fr"
                >
                  data.gouv.fr
                </ExternalLink>
              </li>
            </ul>
          </div>
        </div>
        <div className="fr-footer__bottom">
          <ul className="fr-footer__bottom-list">
            <li className="fr-footer__bottom-item">
              <Link
                className="fr-footer__bottom-link"
                href="/accessibilite"
              >
                Accessibilité : partiellement conforme
              </Link>
            </li>
            <li className="fr-footer__bottom-item">
              <Link
                className="fr-footer__bottom-link"
                href="/mentions-legales"
              >
                Mentions légales
              </Link>
            </li>
            <li className="fr-footer__bottom-item">
              <Link
                className="fr-footer__bottom-link"
                href="/conditions-generales-utilisation"
              >
                Conditions générales d&apos;utilisation
              </Link>
            </li>
            <li className="fr-footer__bottom-item">
              <Link
                className="fr-footer__bottom-link"
                href="/politique-confidentialite"
              >
                Politique de confidentialité
              </Link>
            </li>
          </ul>
          <div className="fr-footer__bottom-copy">
            <p>
              Sauf mention explicite de propriété intellectuelle détenue par des tiers,
              les contenus de ce site sont proposés sous
              {' '}
              <ExternalLink
                href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
                title="licence etalab-2.0"
              >
                licence etalab-2.0
              </ExternalLink>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
