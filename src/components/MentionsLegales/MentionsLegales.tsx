import { ReactElement } from 'react'

import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function MentionsLegales(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <article
        aria-labelledby="mentions-title"
        className="fr-col-12 fr-col-lg-10"
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
              Stanislas BOURRON
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
          <h2
            className="fr-h6"
            id="accessibilite-title"
          >
            Accessibilité
          </h2>
          <p>
            La conformité aux normes d&apos;accessibilité numérique est un objectif ultérieur
            mais nous tâchons de rendre ce site accessible à toutes et à tous.
          </p>

          <h3 className="fr-text--md fr-mt-3w">
            En savoir plus
          </h3>
          <p>
            Pour en savoir plus sur la politique d&apos;accessibilité numérique de l&apos;État :
            {' '}
            <ExternalLink
              href="https://accessibilite.numerique.gouv.fr/"
              title="Politique d'accessibilité numérique de l'État"
            >
              https://accessibilite.numerique.gouv.fr/
            </ExternalLink>
          </p>

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

        <section
          aria-labelledby="securite-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="securite-title"
          >
            Sécurité
          </h2>
          <p>
            Le site est protégé par un certificat électronique, matérialisé pour la grande majorité
            des navigateurs par un cadenas. Cette protection participe à la confidentialité des échanges.
          </p>
          <p>
            En aucun cas les services associés à la plateforme ne seront à l&apos;origine d&apos;envoi
            d&apos;email pour demander la saisie d&apos;informations personnelles.
          </p>
        </section>
      </article>
    </div>
  )
}
