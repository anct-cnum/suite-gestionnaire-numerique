import { ReactElement } from 'react'

import styles from './Accessibilite.module.css'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function Accessibilite(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <article
        aria-labelledby="declaration-accessibilite-title"
        className={`fr-col-12 fr-col-lg-10 ${styles.article}`}
      >
        <PageTitle>
          Déclaration d&apos;accessibilité
        </PageTitle>

        <p>
          Établie le
          {' '}
          <span>
            18 juin 2025.
          </span>
        </p>

        <p>
          <span>
            ANCT - Agence Nationale de la Cohésion des Territoires
          </span>
          {' '}
          s&apos;engage à rendre son service accessible, conformément à
          l&apos;article 47 de la loi n° 2005-102 du 11 février 2005.
        </p>

        <p>
          Cette déclaration d&apos;accessibilité s&apos;applique à
          {' '}
          <strong>
            Mon Inclusion Numérique
          </strong>
          {' '}
          <span>
            (
            <ExternalLink
              href="https://mon.inclusion-numerique.anct.gouv.fr/"
              title="Mon Inclusion Numérique"
            >
              https://mon.inclusion-numerique.anct.gouv.fr/
            </ExternalLink>
            ).
          </span>
        </p>

        <section
          aria-labelledby="etat-conformite-title"
          className="fr-mb-4w"
        >
          <div className="fr-callout fr-callout--brown-caramel">
            <h2
              className="fr-h6 fr-callout__title"
              id="etat-conformite-title"
            >
              État de conformité
            </h2>
            <p className="fr-callout__text">
              <strong>
                Mon Inclusion Numérique
              </strong>
              {' '}
              est
              {' '}
              <strong>
                <span data-printfilter="lowercase">
                  non conforme
                </span>
              </strong>
              {' '}
              avec le
              {' '}
              <abbr title="Référentiel général d'amélioration de l'accessibilité">
                RGAA
              </abbr>
              .
              {' '}
              <span>
                Le site n&apos;a encore pas été audité.
              </span>
            </p>
          </div>
        </section>

        <section
          aria-labelledby="amelioration-contact-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="amelioration-contact-title"
          >
            Amélioration et contact
          </h2>
          <p>
            Si vous n&apos;arrivez pas à accéder à un contenu ou à un service,
            vous pouvez contacter le responsable de
            {' '}
            <span>
              Mon Inclusion Numérique
            </span>
            {' '}
            pour être orienté vers une alternative accessible ou obtenir le
            contenu sous une autre forme.
          </p>
          <div className="fr-highlight fr-mb-3w">
            <p className="fr-mb-0">
              <strong>
                E-mail&nbsp;:
              </strong>
              {' '}
              <a
                className="fr-link"
                href="mailto:societe.numerique@anct.gouv.fr"
              >
                societe.numerique@anct.gouv.fr
              </a>
            </p>
          </div>
        </section>

        <section
          aria-labelledby="voie-recours-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="voie-recours-title"
          >
            Voie de recours
          </h2>
          <p>
            Cette procédure est à utiliser dans le cas suivant&nbsp;: vous avez
            signalé au responsable du site internet un défaut
            d&apos;accessibilité qui vous empêche d&apos;accéder à un contenu ou à un
            des services du portail et vous n&apos;avez pas obtenu de réponse
            satisfaisante.
          </p>
          <p>
            Vous pouvez&nbsp;:
          </p>
          <ul>
            <li>
              Écrire un message au
              {' '}
              <ExternalLink
                href="https://formulaire.defenseurdesdroits.fr/"
                title="Défenseur des droits"
              >
                Défenseur des droits
              </ExternalLink>
            </li>
            <li>
              Contacter
              {' '}
              <ExternalLink
                href="https://www.defenseurdesdroits.fr/saisir/delegues"
                title="le délégué du Défenseur des droits dans votre région"
              >
                le délégué du Défenseur des droits dans votre région
              </ExternalLink>
            </li>
            <li>
              Envoyer un courrier par la poste (gratuit, ne pas mettre de timbre)&nbsp;:
              <br />
              Défenseur des droits
              <br />
              Libre réponse 71120 75342 Paris CEDEX 07
            </li>
          </ul>
        </section>

        <hr className="fr-hr" />

        <p className="fr-text--sm">
          Cette déclaration d&apos;accessibilité a été créé le
          {' '}
          <span>
            18 juin 2025
          </span>
          {' '}
          grâce au
          {' '}
          <ExternalLink
            href="https://betagouv.github.io/a11y-generateur-declaration/#create"
            title="Générateur de Déclaration d'Accessibilité"
          >
            Générateur de Déclaration d&apos;Accessibilité
          </ExternalLink>
          .
        </p>
      </article>
    </div>
  )
}