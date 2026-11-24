import Link from 'next/link'
import { ReactElement } from 'react'

import ExternalLink from '@/components/shared/ExternalLink/ExternalLink'
import FilAriane from '@/components/vitrine/FilAriane/FilAriane'

// Plan du site organisé comme le menu principal (RGAA 12.1 et 12.3), avec les adresses publiques de la vitrine.
export default function PlanDuSite(): ReactElement {
  return (
    <div className="fr-container fr-pt-3w fr-pb-8w">
      <FilAriane items={[{ href: '/', label: 'Accueil' }, { label: 'Plan du site' }]} />
      <h1 className="fr-mt-5w">Plan du site</h1>

      <h2 className="fr-h4 fr-mt-5w">
        <Link className="fr-link fr-link--lg" href="/">
          Accueil
        </Link>
      </h2>

      <h2 className="fr-h4">
        <Link className="fr-link fr-link--lg" href="/lieux">
          Lieux
        </Link>
      </h2>

      <h2 className="fr-h4">
        <Link className="fr-link fr-link--lg" href="/dispositifs">
          Dispositifs
        </Link>
      </h2>

      <h2 className="fr-h4">Données territoriales</h2>
      <ul>
        <li>
          <Link className="fr-link" href="/donnees-territoriales">
            Rechercher un territoire
          </Link>
        </li>
        <li>
          <Link className="fr-link" href="/donnees-territoriales/synthese-et-indicateurs/national">
            Synthèse et indicateurs (France)
          </Link>
        </li>
        <li>
          <Link className="fr-link" href="/donnees-territoriales/lieux-inclusion/national">
            Lieux d&apos;inclusion (France)
          </Link>
        </li>
        <li>
          <Link className="fr-link" href="/donnees-territoriales/mediateurs-numeriques/national">
            Médiateurs numériques (France)
          </Link>
        </li>
      </ul>
      <p className="fr-mb-5w">
        Les rubriques Gouvernances et Feuille de route se consultent par département : choisissez un territoire depuis «
        Rechercher un territoire ».
      </p>

      <h2 className="fr-h4">Outils numériques</h2>
      <ul className="fr-mb-5w">
        <li>
          <Link className="fr-link" href="/outils-numeriques">
            Tous les outils numériques
          </Link>
        </li>
        <li>
          <Link className="fr-link" href="/outils-numeriques/min">
            Mon Inclusion Numérique
          </Link>
        </li>
      </ul>

      <h2 className="fr-h4">Études et enquêtes</h2>
      <ul className="fr-mb-5w">
        <li>
          <ExternalLink
            className="fr-link"
            href="https://www.societenumerique.gouv.fr/nos-ressources/etudes"
            title="Études"
          >
            Études
          </ExternalLink>
        </li>
        <li>
          <ExternalLink
            className="fr-link"
            href="https://labo.societenumerique.gouv.fr/fr/"
            title="Labo Société Numérique"
          >
            Labo Société Numérique
          </ExternalLink>
        </li>
      </ul>

      <h2 className="fr-h4">Informations légales</h2>
      <ul>
        <li>
          <Link className="fr-link" href="/accessibilite">
            Accessibilité
          </Link>
        </li>
        <li>
          <Link className="fr-link" href="/mentions-legales">
            Mentions légales
          </Link>
        </li>
        <li>
          <Link className="fr-link" href="/conditions-generales-utilisation">
            Conditions générales d&apos;utilisation
          </Link>
        </li>
        <li>
          <Link className="fr-link" href="/politique-confidentialite">
            Politique de confidentialité
          </Link>
        </li>
      </ul>
    </div>
  )
}
