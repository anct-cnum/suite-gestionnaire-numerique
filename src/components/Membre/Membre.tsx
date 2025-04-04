'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import Image from 'next/image'
import Link from 'next/link'
import { Fragment, ReactElement } from 'react'

import styles from './Membre.module.css'
import Badge from '../shared/Badge/Badge'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import Historique from '../shared/Historique/Historique'
import MenuLateral from '../shared/MenuLateral/MenuLateral'
import Notice from '../shared/Notice/Notice'
import PageTitle from '../shared/PageTitle/PageTitle'
import Tag from '../shared/Tag/Tag'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { MembreViewModel } from '@/presenters/membrePresenter'

export default function Membre({ viewModel }: Props): ReactElement {
  ChartJS.register(
    ArcElement,
    Tooltip
  )

  return (
    <div className="fr-grid-row">
      <div className="fr-col-2">
        <MenuLateral menu={menu} />
      </div>
      <div className="fr-col-10 fr-pl-7w">
        <Notice />
        <title>
          {viewModel.identite.nom}
        </title>
        <PageTitle>
          {viewModel.identite.nom}
        </PageTitle>
        <div className="fr-grid-row space-between">
          <div>
            {viewModel.role.roles.map((role) => (
              <Fragment key={role.color}>
                <Badge color={role.color}>
                  {role.nom}
                </Badge>
                {' '}
              </Fragment>
            ))}
          </div>
          <p className="fr-text--sm color-grey">
            Modifiée le
            {' '}
            {viewModel.identite.edition}
            {' '}
            par
            {' '}
            {viewModel.identite.editeur}
          </p>
        </div>
        <section
          aria-labelledby="identite"
          className="grey-border border-radius fr-mb-2w fr-p-4w"
        >
          <header className="separator fr-mb-3w">
            <h2
              className="fr-h6"
              id="identite"
            >
              Identité
            </h2>
          </header>
          <article aria-label="Identité">
            <dl
              aria-label="Identité"
              className="fr-grid-row fr-grid-row--gutters"
              role="list"
            >
              <div className="fr-col-6">
                <dt className="color-grey">
                  Raison sociale
                </dt>
                <dd className="font-weight-500">
                  {viewModel.identite.nom}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Typologie
                </dt>
                <dd className="font-weight-500">
                  {viewModel.identite.typologie}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Numéro de SIRET
                </dt>
                <dd className="font-weight-500">
                  <ExternalLink
                    className="color-blue-france"
                    href={`https://annuaire-entreprises.data.gouv.fr/etablissement/${viewModel.identite.siret}`}
                    title={`Fiche ${viewModel.identite.nom}`}
                  >
                    {viewModel.identite.siret}
                  </ExternalLink>
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Identifiant
                </dt>
                <dd className="font-weight-500">
                  {viewModel.identite.identifiant}
                </dd>
              </div>
              <div className="fr-col-12">
                <dt className="color-grey">
                  Adresse de l’établissement
                </dt>
                <dd className="font-weight-500">
                  {viewModel.identite.adresse}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Région
                </dt>
                <dd className="font-weight-500">
                  {viewModel.identite.region}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Département
                </dt>
                <dd className="font-weight-500">
                  {viewModel.identite.departement}
                </dd>
              </div>
            </dl>
            <aside className="fr-grid-row fr-grid-row--right fr-mt-2w color-grey">
              <p className="fr-m-0">
                Source de données :
                {' '}
                <ExternalLink
                  className="color-blue-france"
                  href="https://annuaire-entreprises.data.gouv.fr/"
                  title="Annuaire des entreprises"
                >
                  Annuaire des entreprises
                </ExternalLink>
              </p>
            </aside>
          </article>
        </section>
        <section
          aria-labelledby="contact"
          className="grey-border border-radius fr-mb-2w fr-p-4w"
        >
          <header className="fr-grid-row space-between separator fr-mb-3w">
            <h2
              className="fr-h6"
              id="contact"
            >
              Contact référent
            </h2>
            <button
              className="fr-link fr-icon-edit-fill fr-link--icon-right fr-mt-n2w"
              type="button"
            >
              Modifier
            </button>
          </header>
          <article aria-label="Contact référent">
            <dl
              aria-label="Contact référent"
              className="fr-grid-row fr-grid-row--gutters"
              role="list"
            >
              <div className="fr-col-6">
                <dt className="color-grey">
                  Nom
                </dt>
                <dd className="font-weight-500">
                  {viewModel.contactReferent.nom}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Prénom
                </dt>
                <dd className="font-weight-500">
                  {viewModel.contactReferent.prenom}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Téléphone professionnel
                </dt>
                <dd className="font-weight-500">
                  {viewModel.contactReferent.telephone}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Adresse électronique
                </dt>
                <dd className="font-weight-500">
                  {viewModel.contactReferent.email}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Fonction
                </dt>
                <dd className="font-weight-500">
                  {viewModel.contactReferent.fonction}
                </dd>
              </div>
            </dl>
          </article>
        </section>
        <section
          aria-labelledby="roleMembre"
          className="grey-border border-radius fr-mb-2w fr-p-4w"
        >
          <header className="separator fr-mb-3w">
            <h2
              className="fr-h6"
              id="roleMembre"
            >
              Rôle
            </h2>
          </header>
          <article aria-label="Rôle">
            <dl
              aria-label="Rôle"
              className="fr-grid-row fr-grid-row--gutters"
              role="list"
            >
              <div className="fr-col-6">
                <dt className="color-grey">
                  Rôle dans la gouvernance
                </dt>
                <dd className="font-weight-500">
                  {viewModel.role.roles.map((role) => (
                    <Fragment key={role.color}>
                      <Badge color={role.color}>
                        {role.nom}
                      </Badge>
                      {' '}
                    </Fragment>
                  ))}
                </dd>
              </div>
              <div className="fr-col-6">
                <dt className="color-grey">
                  Membre depuis le
                </dt>
                <dd className="font-weight-500">
                  {viewModel.role.membreDepuisLe}
                </dd>
              </div>
              <div className="fr-col-12">
                <dt className="color-grey">
                  Feuille de route
                </dt>
                <dd className="font-weight-500">
                  {viewModel.role.feuillesDeRoute.map((feuilleDeRoute) => (
                    <Fragment key={feuilleDeRoute.lien}>
                      <Tag href={feuilleDeRoute.lien}>
                        {feuilleDeRoute.libelle}
                      </Tag>
                      {' '}
                    </Fragment>
                  ))}
                </dd>
              </div>
            </dl>
          </article>
        </section>
        <section
          aria-labelledby="conventionsEtFinancements"
          className="grey-border border-radius fr-mb-2w fr-p-4w"
        >
          <header className="fr-grid-row space-between">
            <div>
              <h2
                className="fr-h6 fr-m-0"
                id="conventionsEtFinancements"
              >
                Conventions et financements
              </h2>
              <p className="fr-text--sm color-grey">
                Conventions et montant des financements engagés par l’état pour ce membre.
              </p>
            </div>
            <div>
              <Link
                className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
                href={viewModel.conventionsEtFinancements.lienConventions}
              >
                Gérer les conventions
              </Link>
            </div>
          </header>
          <article
            aria-label="Financements"
            className="grey-border border-radius fr-mb-2w fr-p-4w"
          >
            <div className="fr-grid-row space-between">
              <dl
                aria-label="Financements"
                className="fr-col-12 fr-col-md-10 fr-col-lg-8"
                role="list"
              >
                <div className="fr-grid-row space-between separator fr-mb-4w fr-pb-2w fr-h6">
                  <dt>
                    Crédits engagés par l’état
                  </dt>
                  <dd className="font-weight-700">
                    {viewModel.conventionsEtFinancements.creditsEngagesParLEtat}
                  </dd>
                </div>
                {viewModel.conventionsEtFinancements.enveloppes.map((enveloppe) => (
                  <div
                    className="fr-grid-row space-between fr-mb-2w"
                    key={enveloppe.libelle}
                  >
                    <dt>
                      <Dot color={colors[enveloppe.color].dot} />
                      {' '}
                      {enveloppe.libelle}
                    </dt>
                    <dd className="font-weight-700">
                      {enveloppe.montantFormate}
                    </dd>
                  </div>
                ))}
              </dl>
              <div>
                <Doughnut
                  backgroundColor={viewModel.conventionsEtFinancements.enveloppes.map(
                    (enveloppe) => colors[enveloppe.color].color
                  )}
                  data={viewModel.conventionsEtFinancements.enveloppes.map((enveloppe) => enveloppe.montant)}
                  labels={viewModel.conventionsEtFinancements.enveloppes.map((enveloppe) => enveloppe.libelle)}
                />
              </div>
            </div>
          </article>
          <article aria-label="Conventions">
            <div className="color-blue-france separator fr-pb-2w fr-mb-2w">
              Conventions
            </div>
            <ul aria-label="Conventions">
              {viewModel.conventionsEtFinancements.conventions.map((convention) => (
                <li key={convention.libelle}>
                  <div className="fr-grid-row space-between">
                    <div>
                      <div>
                        <span
                          aria-hidden="true"
                          className="fr-icon-pen-nib-line color-blue-france fr-mr-1w"
                        />
                        <span className="font-weight-700">
                          {convention.libelle}
                        </span>
                        {' '}
                        <Badge color={convention.statut.variant}>
                          {convention.statut.libelle}
                        </Badge>
                      </div>
                      <div>
                        <span className="fr-text--sm color-grey">
                          Expire le
                          {' '}
                          {convention.expiration}
                        </span>
                      </div>
                    </div>
                    <div>
                      <Link
                        className="fr-mb-2w fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-download-line"
                        href={convention.telechargement}
                        title={`Télécharger ${convention.libelle}`}
                      >
                        Télécharger
                      </Link>
                    </div>
                  </div>
                  {
                    convention.documents.length > 0 ? (
                      <div className="background-blue-france fr-p-3w fr-mb-2w">
                        <div className="color-blue-france fr-mb-2w">
                          2 documents associés
                        </div>
                        <ul>
                          {
                            convention.documents.map((document) => (
                              <li
                                className="fr-grid-row space-between"
                                key={document.libelle}
                              >
                                <div>
                                  <div>
                                    <svg
                                      className={styles.sup}
                                      fill="none"
                                      height="16"
                                      width="11"
                                    >
                                      <path
                                        d="M1 .5v10a4 4 0 0 0 4 4h6"
                                        stroke="#CECECE"
                                        strokeWidth="1.5"
                                      />
                                    </svg>
                                    <span className="font-weight-700">
                                      {document.libelle}
                                    </span>
                                    {' '}
                                    <Badge color={document.statut.variant}>
                                      {document.statut.libelle}
                                    </Badge>
                                  </div>
                                  <div>
                                    <Link
                                      className="color-blue-france"
                                      href={document.lienConseilleNumerique}
                                    >
                                      {document.conseilleNumerique}
                                    </Link>
                                    ,
                                    {' '}
                                    <span className="fr-text--sm color-grey">
                                      {document.contratDeTravail}
                                      , Expire le
                                      {' '}
                                      {document.expiration}
                                    </span>
                                  </div>
                                </div>
                                <div>
                                  <Link
                                    className="fr-mb-2w fr-btn fr-btn--secondary fr-icon-download-line"
                                    href={document.telechargement}
                                    title={`Télécharger ${document.libelle}`}
                                  />
                                </div>
                              </li>
                            ))
                          }
                        </ul>
                      </div>
                    ) : null
                  }
                </li>
              ))}
            </ul>
          </article>
        </section>
        <section
          aria-labelledby="aidantsEtMediateurs"
          className="grey-border border-radius fr-mb-2w fr-p-4w"
        >
          <header className="separator fr-mb-3w">
            <div className="fr-grid-row space-between">
              <div>
                <h2
                  className="fr-h6 fr-m-0"
                  id="aidantsEtMediateurs"
                >
                  Aidants et médiateurs
                </h2>
                <p className="fr-text--sm color-grey">
                  Ressources humaines dédiés à l’inclusion numérique portés par la structure.
                </p>
              </div>
              <div>
                <Link
                  className="fr-btn fr-btn--secondary fr-btn--icon-right fr-icon-arrow-right-line"
                  href="/aidants-et-mediateurs"
                >
                  Gérer les aidants et médiateurs
                </Link>
              </div>
            </div>
            <div className="fr-grid-row fr-grid-row--gutters">
              <div className="fr-col-12 fr-col-md-4 fr-col-sm-6">
                <div className="fr-grid-row background-blue-france fr-p-3w fr-mb-4w">
                  <div className="fr-h1 fr-m-0">
                    <TitleIcon
                      background="white"
                      icon="user-star-line"
                    />
                  </div>
                  <div>
                    <p className="fr-m-0">
                      <span className="fr-h6 font-weight-700 fr-m-0 color-blue-france">
                        {viewModel.aidantsEtMediateurs.totalCoordinateur}
                        {' '}
                      </span>
                      <br />
                      <span className="font-weight-500 color-blue-france">
                        Coordinateur
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-4 fr-col-sm-6">
                <div className="fr-grid-row background-blue-france fr-p-3w fr-mb-4w">
                  <div className="fr-h1 fr-m-0">
                    <TitleIcon
                      background="white"
                      icon="account-pin-circle-line"
                    />
                  </div>
                  <div>
                    <p className="fr-m-0">
                      <span className="fr-h6 font-weight-700 fr-m-0 color-blue-france">
                        {viewModel.aidantsEtMediateurs.totalMediateur}
                        {' '}
                      </span>
                      <br />
                      <span className="font-weight-500 color-blue-france">
                        Médiateurs numériques
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="fr-col-12 fr-col-md-4 fr-col-sm-6">
                <div className="fr-grid-row background-blue-france fr-p-3w fr-mb-4w">
                  <div className="fr-h1 fr-m-0">
                    <TitleIcon
                      background="white"
                      icon="team-line"
                    />
                  </div>
                  <div>
                    <p className="fr-m-0">
                      <span className="fr-h6 font-weight-700 fr-m-0 color-blue-france">
                        {viewModel.aidantsEtMediateurs.totalAidant}
                        {' '}
                      </span>
                      <br />
                      <span className="font-weight-500 color-blue-france">
                        Aidants numériques
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </header>
          <article aria-label="Aidants et médiateurs">
            <ul>
              {
                viewModel.aidantsEtMediateurs.liste.map((aidant) => (
                  <li
                    className="separator fr-mb-3w fr-pb-2w"
                    key={aidant.nom}
                  >
                    <Link href={aidant.lienFiche}>
                      <div className="font-weight-700">
                        <span
                          aria-hidden="true"
                          className="fr-icon-user-line color-blue-france fr-mr-1w"
                        />
                        {aidant.nom}
                        {
                          aidant.logos.map((logo) => (
                            <Image
                              alt=""
                              className="fr-ml-1w"
                              height={24}
                              key={logo}
                              src={logo}
                              width={24}
                            />
                          ))
                        }
                      </div>
                      <div className="fr-text--sm color-grey fr-m-0">
                        {aidant.fonction}
                      </div>
                    </Link>
                  </li>
                ))
              }
            </ul>
            <aside className="fr-grid-row fr-grid-row--right fr-mt-2w color-grey">
              <p className="fr-m-0">
                Source de données :
                {' '}
                <ExternalLink
                  className="color-blue-france"
                  href="https://coop-numerique.anct.gouv.fr/"
                  title="La Coop de la médiation numérique"
                >
                  La Coop de la médiation numérique
                </ExternalLink>
              </p>
            </aside>
          </article>
        </section>
        <section
          aria-labelledby="historique"
          className="grey-border border-radius fr-mb-2w fr-p-4w fr-sr-only"
        >
          <Historique
            historique={viewModel.historiques}
            sousTitre="Historique des dernières actions effectuées pour ce membre."
            titre="Historique des dernières actions"
          />
        </section>
      </div>
    </div>
  )
}

type Props = Readonly<{
  viewModel: MembreViewModel
}>

const colors = {
  france: {
    color: '#6a6af4',
    dot: 'dot-blue-france-main-525',
  },
  menthe: {
    color: '#009081',
    dot: 'dot-green-menthe-main-548',
  },
  tilleul: {
    color: '#fbe769',
    dot: 'dot-green-tilleul-verveine-925',
  },
}

const menu = [
  {
    libelle: 'Identité',
    url: '#identite',
  },
  {
    libelle: 'Contact référent',
    url: '#contact',
  },
  {
    libelle: 'Rôle',
    url: '#roleMembre',
  },
  {
    libelle: 'Conventions et financements',
    url: '#conventionsEtFinancements',
  },
  {
    libelle: 'Aidants et médiateurs',
    url: '#aidantsEtMediateurs',
  },
  {
    libelle: 'Historique des dernières actions',
    url: '#historique',
  },
] as const
