import { ReactElement } from 'react'

import styles from './PolitiqueConfidentialite.module.css'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import PageTitle from '../shared/PageTitle/PageTitle'

export default function PolitiqueConfidentialite(): ReactElement {
  return (
    <div className="fr-grid-row fr-grid-row--center">
      <article
        aria-labelledby="politique-confidentialite-title"
        className={`fr-col-12 fr-col-lg-10 ${styles.article}`}
      >
        <PageTitle>
          Politique de confidentialité – Mon inclusion numérique,
          en lien avec l&apos;Entrepôt de données de l&apos;inclusion numérique
        </PageTitle>

        <section
          aria-labelledby="qui-sommes-nous-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="qui-sommes-nous-title"
          >
            Qui sommes-nous ?
          </h2>
          <p>
            <strong>
              Mon inclusion numérique
            </strong>
            {' '}
            est un service public numérique développé par le programme Société Numérique de
            l&apos;ANCT. Il a deux objectifs :
          </p>
          <ul>
            <li>
              - mesurer précisément l&apos;impact de la politique publique d&apos;inclusion
              numérique, notamment en évaluant la montée en compétence des bénéficiaires
              d&apos;accompagnement au numérique ;
            </li>
            <li>
              - piloter l&apos;ensemble des dispositifs d&apos;inclusion numérique déployés à
              une échelle nationale, régionale, départementale, communale.
            </li>
          </ul>
          <br />
          <p>
            Pour cela, Mon inclusion numérique expose et administre les données de l&apos;entrepôt
            de données de l&apos;inclusion numérique de l&apos;ANCT ayant vocation à rassembler
            l&apos;ensemble des données relatives à l&apos;inclusion numérique.
          </p>
          <p>
            Le responsable de traitement est l&apos;ANCT représentée par monsieur Stanislas Bourron,
            en sa qualité de directeur général de l&apos;ANCT.
          </p>
        </section>

        <section
          aria-labelledby="pourquoi-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="pourquoi-title"
          >
            Pourquoi traitons-nous des données à caractère personnel ?
          </h2>
          <p>
            Mon inclusion numérique traite des données à caractère personnel pour mettre à
            disposition de tous les acteurs de l&apos;inclusion numérique une interface de pilotage
            qui recense les données des dispositifs numériques déployés sur le territoire.
          </p>
          <p>
            Les données sont notamment traitées pour fournir un accès authentifié à la plateforme
            aux acteurs de l&apos;inclusion numérique habilités. Les données relatives aux aidants,
            aux médiateurs numériques, aux bénéficiaires ont été transmises par différents services
            numériques, incluant notamment Conseillers numériques, Aidants Connect, La coop de
            la médiation numérique, Cartographie des lieux de l&apos;inclusion numérique et data·inclusion.
          </p>
        </section>

        <section
          aria-labelledby="donnees-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="donnees-title"
          >
            Quelles sont les données à caractère personnel que nous traitons ?
          </h2>
          <p>
            Les données traitées sont les suivantes :
          </p>
          <ul>
            <li>
              <strong>
                - Données relatives aux comptes des acteurs de l&apos;inclusion numérique via ProConnect :
              </strong>
              {' '}
              nom, prénom, adresse courriel, numéro de téléphone professionnel ;
            </li>
            <li>
              <strong>
                - Données relatives aux contacts principaux des structures de rattachement des
                acteurs de l&apos;inclusion numérique :
              </strong>
              {' '}
              nom, prénom, adresse courriel.
            </li>
          </ul>
        </section>

        <section
          aria-labelledby="autorisation-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="autorisation-title"
          >
            Qu&apos;est-ce qui nous autorise à traiter des données à caractère personnel ?
          </h2>
          <p>
            Le traitement est nécessaire à l&apos;exécution d&apos;une mission d&apos;intérêt public
            ou relevant de l&apos;exercice de l&apos;autorité publique dont est investie l&apos;ANCT
            en tant que responsable de traitement, au sens de l&apos;article 6-1 e) du RGPD.
          </p>
          <p>
            Cette mission d&apos;intérêt public se traduit en pratique notamment par l&apos;article
            L. 1231-2 du code général des collectivités territoriales.
          </p>
        </section>

        <section
          aria-labelledby="conservation-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="conservation-title"
          >
            Pendant combien de temps conservons-nous vos données ?
          </h2>
          <div className="fr-table fr-table--no-caption">
            <table>
              <caption>
                Durée de conservation des données
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    Catégories de données
                  </th>
                  <th scope="col">
                    Durée de conservation
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Données relatives aux comptes des acteurs de l&apos;inclusion numérique
                  </td>
                  <td>
                    2 ans à partir de la dernière connexion
                  </td>
                </tr>
                <tr>
                  <td>
                    Données relatives aux contacts principaux des structures de rattachement des
                    acteurs de l&apos;inclusion numérique
                  </td>
                  <td>
                    2 ans à partir de la dernière connexion
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          aria-labelledby="droits-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="droits-title"
          >
            Quels sont vos droits ?
          </h2>
          <p>
            Vous disposez :
          </p>
          <ul>
            <li>
              - D&apos;un droit d&apos;information et d&apos;accès à vos données ;
            </li>
            <li>
              - D&apos;un droit de rectification ;
            </li>
            <li>
              - D&apos;un droit d&apos;opposition ;
            </li>
            <li>
              - D&apos;un droit à la limitation du traitement de vos données.
            </li>
          </ul>
          <br />
          <p>
            Pour exercer vos droits, vous pouvez nous contacter à :
            {' '}
            <a
              className="fr-link"
              href="mailto:dpo@anct.gouv.fr"
            >
              dpo@anct.gouv.fr
            </a>
          </p>
          <p>
            Puisque ce sont des droits personnels, nous ne traiterons votre demande que si nous
            sommes en mesure de vous identifier. Dans le cas contraire, nous pouvons être amenés
            à vous demander une preuve de votre identité.
          </p>
          <p>
            Nous nous engageons à répondre à votre demande dans un délai raisonnable qui ne saurait
            excéder 1 mois à compter de la réception de votre demande.
          </p>
          <p>
            Si vous estimez que vos droits n&apos;ont pas été respectés après nous avoir contactés,
            vous pouvez adresser une réclamation à la CNIL.
          </p>
        </section>

        <section
          aria-labelledby="acces-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="acces-title"
          >
            Qui peut avoir accès à vos données ?
          </h2>
          <p>
            Seuls les membres habilités de l&apos;équipe de Mon inclusion numérique
            (administrateurs, développeurs notamment) ont accès à vos données,
            dans le cadre de leurs missions.
          </p>
        </section>

        <section
          aria-labelledby="sous-traitants-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="sous-traitants-title"
          >
            Qui nous aide à traiter vos données ?
          </h2>
          <p>
            Certaines données sont communiquées à des « sous-traitants » qui agissent pour
            le compte de l&apos;ANCT, selon ses instructions.
          </p>
          <div className="fr-table fr-table--no-caption">
            <table>
              <caption>
                Liste des sous-traitants
              </caption>
              <thead>
                <tr>
                  <th scope="col">
                    Sous-traitant
                  </th>
                  <th scope="col">
                    Traitement réalisé
                  </th>
                  <th scope="col">
                    Pays destinataire
                  </th>
                  <th scope="col">
                    Garanties
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>
                    Scaleway
                  </td>
                  <td>
                    Hébergement
                  </td>
                  <td>
                    France
                  </td>
                  <td>
                    <ExternalLink
                      href="https://www-uploads.scaleway.com/DPA_FR_v17072024_439cb4fdae.pdf"
                      title="Garanties Scaleway"
                    >
                      DPA Scaleway
                    </ExternalLink>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section
          aria-labelledby="cookies-title"
          className="fr-mb-4w"
        >
          <h2
            className="fr-h6"
            id="cookies-title"
          >
            Témoins de connexion et traceurs
          </h2>
          <p>
            Un témoin de connexion est un fichier déposé sur votre terminal lors de la visite
            d&apos;un site. Il a pour but de collecter des informations relatives à votre navigation
            et de vous adresser des services adaptés à votre terminal (ordinateur, mobile ou tablette).
          </p>
          <p>
            En application de l&apos;article 5-3 de la directive ePrivacy, transposée à
            l&apos;article 82 de la loi n° 78-17 du 6 janvier 1978 relative à l&apos;informatique,
            aux fichiers et aux libertés, les témoins de connexion et traceurs suivent deux régimes
            distincts.
          </p>
          <p>
            D&apos;une part, ceux strictement nécessaires au service ou ayant pour finalité
            exclusive de faciliter la communication par voie électronique, sont dispensés de consentement préalable.
          </p>
          <p>
            D&apos;autre part, ceux n&apos;étant pas strictement nécessaires au service ou
            n&apos;ayant pas pour finalité exclusive de faciliter la communication par voie
            électronique, doivent être consenti par l&apos;utilisateur.
          </p>
          <p>
            Ce consentement de la personne concernée constitue une base légale au sens du RGPD,
            à savoir l&apos;article 6-1 a). Mon inclusion numérique ne dépose que des témoins de
            connexion et traceurs strictement nécessaires au fonctionnement du service et la
            solution de mesure d&apos;audience « Matomo », configurée en mode « exempté » et ne
            nécessitant pas de recueil du consentement, conformément aux recommandations de la CNIL.
          </p>
          <p>
            Pour en savoir plus sur les témoins de connexion :
          </p>
          <ul>
            <li>
              <ExternalLink
                href="https://www.cnil.fr/fr/cookies-et-traceurs-que-dit-la-loi"
                title="Cookies et traceurs : que dit la loi ?"
              >
                Cookies et traceurs : que dit la loi ?
              </ExternalLink>
            </li>
            <li>
              <ExternalLink
                href="https://www.cnil.fr/fr/cookies-les-outils-pour-les-maitriser"
                title="Cookies les outils pour les maîtriser"
              >
                Cookies les outils pour les maîtriser
              </ExternalLink>
            </li>
          </ul>
        </section>
      </article>
    </div>
  )
}
