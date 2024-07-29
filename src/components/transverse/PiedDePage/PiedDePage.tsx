import Link from 'next/link'
import { ReactElement } from 'react'

import LienExterne from '../../shared/LienExterne/LienExterne'

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
              href="/"
              title="Accueil"
            >
              <p className="fr-logo">
                République
                <br />
                Française
              </p>
            </Link>
          </div>
          <div className="fr-footer__content">
            <p className="fr-footer__content-desc">
              Lorem [...] elit ut.
            </p>
            <ul className="fr-footer__content-list">
              <li className="fr-footer__content-item">
                <LienExterne
                  className="fr-footer__content-link"
                  href="https://legifrance.gouv.fr"
                  title="legifrance.gouv.fr"
                >
                  legifrance.gouv.fr
                </LienExterne>
              </li>
              <li className="fr-footer__content-item">
                <LienExterne
                  className="fr-footer__content-link"
                  href="https://gouvernement.fr"
                  title="gouvernement.fr"
                >
                  gouvernement.fr
                </LienExterne>
              </li>
              <li className="fr-footer__content-item">
                <LienExterne
                  className="fr-footer__content-link"
                  href="https://service-public.fr"
                  title="service-public.fr"
                >
                  service-public.fr
                </LienExterne>
              </li>
              <li className="fr-footer__content-item">
                <LienExterne
                  className="fr-footer__content-link"
                  href="https://data.gouv.fr"
                  title="data.gouv.fr"
                >
                  data.gouv.fr
                </LienExterne>
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
              <LienExterne
                className="fr-footer__bottom-link"
                href="https://cdn.conseiller-numerique.gouv.fr/CGU-Données_personnellesConseiller_Numérique.pdf"
                title="Données personnelles"
              >
                Données personnelles
              </LienExterne>
            </li>
          </ul>
          <div className="fr-footer__bottom-copy">
            <p>
              Sauf mention explicite de propriété intellectuelle détenue par des tiers,
              les contenus de ce site sont proposés sous
              {' '}
              <LienExterne
                href="https://github.com/etalab/licence-ouverte/blob/master/LO.md"
                title="licence etalab-2.0"
              >
                licence etalab-2.0
              </LienExterne>
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
