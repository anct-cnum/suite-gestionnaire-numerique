import { ReactElement } from 'react'

import styles from './MentionsLegales.module.css'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function MentionsLegales(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <article
        aria-labelledby="mentions-title"
        className={`fr-col-12 fr-col-lg-10 ${styles.article}`}
        style={{ maxWidth: '960px' }}
      >
        <PageTitle>
          Mentions légales
        </PageTitle>

        <section
          aria-labelledby="editeur-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="editeur-title"
          >
            Éditeur de la plateforme
          </h2>
          <p>
            <strong>
              Mon inclusion numérique
            </strong>
            {' '}
            est édité au sein de l&apos;Agence nationale de la cohésion des territoires (ANCT) située :
          </p>
          <address className="fr-mb-3w">
            <div>
              20 avenue de Ségur
            </div>
            <div>
              75007 Paris
            </div>
            <div>
              France
            </div>
          </address>
          <p>
            <strong>
              Téléphone :
            </strong>
            {' '}
            <a
              className="fr-link"
              href="tel:+33185586000"
            >
              01 85 58 60 00
            </a>
          </p>
        </section>

        <section
          aria-labelledby="directeur-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="directeur-title"
          >
            Directeur de la publication
          </h2>
          <p>
            Le directeur de publication est Monsieur
            {' '}
            <strong>
              Henri PREVOST
            </strong>
            {' '}
            , Directeur général de l&apos;ANCT.
          </p>
        </section>

        <section
          aria-labelledby="hebergeur-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="hebergeur-title"
          >
            Hébergement de la plateforme
          </h2>
          <p>
            La plateforme est hébergée par :
          </p>
          <address className="fr-mb-3w">
            <div>
              <strong>
                Scalingo
              </strong>
            </div>
            <div>
              9 rue de la Kruteneau
            </div>
            <div>
              67000 Strasbourg
            </div>
            <div>
              France
            </div>
          </address>
        </section>

        <section
          aria-labelledby="accessibilite-title"
          className="fr-mb-4w"
        >
          <h3 className="fr-text--md fr-mt-3w">
            Signaler un dysfonctionnement
          </h3>
          <p>
            Si vous rencontrez un défaut d&apos;accessibilité vous empêchant d&apos;accéder
            à un contenu ou une fonctionnalité du site, merci de nous en faire part :
            {' '}
            <a
              className="fr-link"
              href="mailto:societe.numerique@anct.gouv.fr"
            >
              societe.numerique@anct.gouv.fr
            </a>
          </p>
          <p>
            Si vous n&apos;obtenez pas de réponse rapide de notre part, vous êtes en droit
            de faire parvenir vos doléances ou une demande de saisine au Défenseur des droits.
          </p>
        </section>
      </article>
    </div>
  )
}
