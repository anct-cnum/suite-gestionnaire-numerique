'use client'

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import Image from 'next/image'
import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import styles from './TableauDeBord.module.css'
import Bar from '../shared/Bar/Bar'
import { clientContext } from '../shared/ClientContext'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import InformationLogo from '../shared/InformationLogo/InformationLogo'
import Map from '../shared/Map/Map'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { CommuneFragilite } from '@/presenters/indiceFragilitePresenter'
import { TableauDeBordViewModel } from '@/presenters/tableauDeBordPresenter'

export default function TableauDeBord({ communeFragilite, tableauDeBordViewModel }: Props): ReactElement {
  const { sessionUtilisateurViewModel } = useContext(clientContext)

  ChartJS.register(
    ArcElement,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip
  )

  return (
    <>
      <PageTitle>
        <span>
          👋 Bonjour
          {' '}
          {sessionUtilisateurViewModel.prenom}
        </span>
        <br />
        <span className="fr-text--lead color-blue-france">
          Bienvenue sur l’outil de pilotage de l’Inclusion Numérique ·
          {' '}
          {tableauDeBordViewModel.departement}
        </span>
      </PageTitle>
      <section
        aria-labelledby="taches"
        className="fr-mb-4w"
      >
        <h2
          className="fr-h4 color-blue-france fr-m-0"
          id="taches"
        >
          Tâches à réaliser
        </h2>
        <ul className="background-blue-france fr-p-2w">
          {
            tableauDeBordViewModel.taches.map((tache) => (
              <li
                className={`fr-grid-row fr-btns-group--space-between fr-p-2w fr-m-1w ${styles.tache}`}
                key={tache.label}
              >
                <div className="color-blue-france font-weight-500">
                  👉
                  {' '}
                  {tache.label}
                </div>
                <div className="fr-text--xs fr-m-0">
                  {tache.context}
                </div>
                <div>
                  <Link
                    className="fr-btn"
                    href="/"
                  >
                    {tache.lien}
                  </Link>
                </div>
              </li>
            ))
          }
        </ul>
      </section>
      <hr />
      <section
        aria-labelledby="etatDesLieux"
        className="fr-mb-4w"
      >
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="france-line" />
            <div>
              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="etatDesLieux"
              >
                État des lieux de l’inclusion numérique
              </h2>
              <p className="fr-m-0 font-weight-500">
                Données cumulées des dispositifs : Conseillers Numériques et Aidants Connect
              </p>
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href="/lieux-inclusion"
          >
            Lieux d’inclusion numérique
          </Link>
        </div>
        <div className="fr-grid-row">
          <div className="fr-col-8 background-blue-france">
            <div className="fr-grid-row space-between fr-p-4w">
              <div className="font-weight-700 color-blue-france">
                Indice de Fragilité numérique
              </div>
              <div className="color-grey">
                Mise à jour le 23/09/2024
              </div>
            </div>
            <Map
              communesFragilite={communeFragilite}
              departement="69"
            />
          </div>
          <div className="fr-col-4">
            <div className="background-blue-france fr-p-4w fr-mb-1w fr-ml-1w">
              <div className="fr-h1 fr-m-0">
                <TitleIcon
                  background="white"
                  icon="map-pin-2-line"
                />
                {tableauDeBordViewModel.etatDesLieux.inclusionNumerique}
              </div>
              <div className="font-weight-500">
                Lieux d’inclusion numérique
              </div>
              <div className="fr-text--xs color-blue-france fr-mb-0">
                Toutes les typologies de lieux publics ou privés
              </div>
            </div>
            <div className="background-blue-france fr-p-4w fr-mb-1w fr-ml-1w">
              <div className="fr-h1 fr-m-0">
                <TitleIcon
                  background="white"
                  icon="map-pin-user-line"
                />
                {tableauDeBordViewModel.etatDesLieux.mediateursEtAidants}
              </div>
              <div className="font-weight-500">
                Médiateurs et aidants numériques
              </div>
              <div className="fr-text--xs color-blue-france fr-mb-0">
                Conseillers numériques, coordinateurs, Aidants, …
              </div>
            </div>
            <div className="background-blue-france fr-p-4w fr-ml-1w">
              <div className="fr-h1 fr-m-0">
                <TitleIcon
                  background="white"
                  icon="compass-3-line"
                />
                {tableauDeBordViewModel.etatDesLieux.accompagnementRealise}
              </div>
              <div className="font-weight-500">
                Accompagnements réalisés
              </div>
              <div className="fr-text--xs color-blue-france fr-mb-0">
                Total cumulé des dispositifs
              </div>
              <Bar
                backgroundColor={tableauDeBordViewModel.etatDesLieux.graphique.backgroundColor}
                data={tableauDeBordViewModel.etatDesLieux.graphique.data}
                labels={tableauDeBordViewModel.etatDesLieux.graphique.labels}
              />
            </div>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="gouvernance"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="compass-3-line" />
            <div>
              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="gouvernance"
              >
                Gouvernances
              </h2>
              <p className="fr-m-0 font-weight-500">
                Acteurs de l’inclusion numérique
              </p>
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href="/gouvernance/11"
          >
            La gouvernance
          </Link>
        </div>
        <div className="fr-grid-row">
          <div className="fr-col background-blue-france fr-p-4w fr-mr-4w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="bank-line"
              />
              {tableauDeBordViewModel.gouvernance.membre.total}
            </div>
            <div className="font-weight-500">
              Membres de la gouvernance
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              dont
              {' '}
              <span className="font-weight-700">
                {tableauDeBordViewModel.gouvernance.membre.coporteur}
                {' '}
                coporteurs
              </span>
            </div>
          </div>
          <div className="fr-col background-blue-france fr-p-4w fr-mr-4w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="community-line"
              />
              {tableauDeBordViewModel.gouvernance.collectivite.total}
            </div>
            <div className="font-weight-500">
              Collectivité impliquées
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              sur les
              {' '}
              <span className="font-weight-700">
                {tableauDeBordViewModel.gouvernance.collectivite.membre}
                {' '}
                membres
              </span>
            </div>
          </div>
          <div className="fr-col background-blue-france fr-p-4w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="file-download-line"
              />
              {tableauDeBordViewModel.gouvernance.feuilleDeRoute.total}
            </div>
            <div className="font-weight-500">
              Feuilles de route déposées
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              comprenant
              {' '}
              <span className="font-weight-700">
                {tableauDeBordViewModel.gouvernance.feuilleDeRoute.action}
                {' '}
                actions enregistrées
              </span>
            </div>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="conventionnements"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="pen-nib-line" />
            <div>
              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="conventionnements"
              >
                Conventionnements et financements
              </h2>
              <p className="fr-m-0 font-weight-500">
                Chiffres clés des budgets et financements
              </p>
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href="/gouvernance/11/financements"
          >
            Les demandes
          </Link>
        </div>
        <div className="fr-grid-row fr-mb-4w">
          <div className="fr-col background-blue-france fr-p-4w fr-mr-4w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="money-euro-circle-line"
              />
              {tableauDeBordViewModel.conventionnement.budget.total}
            </div>
            <div className="font-weight-500">
              Budget global renseigné
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              pour
              {' '}
              <span className="font-weight-700">
                {tableauDeBordViewModel.conventionnement.budget.feuilleDeRoute}
                {' '}
                feuille de route
              </span>
            </div>
          </div>
          <div className="fr-col background-blue-france fr-p-4w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="download-line"
              />
              {tableauDeBordViewModel.conventionnement.credit.total}
            </div>
            <div className="font-weight-500">
              Crédits engagés par l’état
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              Soit
              {' '}
              <span className="font-weight-700">
                {tableauDeBordViewModel.conventionnement.credit.pourcentage}
                {' '}
                % de votre budget global
              </span>
            </div>
          </div>
        </div>
        <div className="font-weight-500">
          4 financements engagés par l’état
        </div>
        <ul>
          {
            tableauDeBordViewModel.conventionnement.details.map((detail) => (
              <li
                className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                key={detail.label}
              >
                <div>
                  <Dot color={detail.color} />
                  {' '}
                  {detail.label}
                </div>
                <div className="font-weight-700">
                  {detail.total}
                </div>
              </li>
            ))
          }
        </ul>
      </section>
      <section
        aria-labelledby="beneficiaires"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div className="fr-grid-row fr-grid-row--middle space-between separator fr-pb-3w fr-mb-3w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="community-line" />
            <div>

              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="beneficiaires"
              >
                Bénéficiaires de financement(s)
              </h2>
              <p className="fr-m-0 font-weight-500">
                Chiffres clés sur les bénéficiaires de financement(s)
              </p>
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href="/gouvernance/11/beneficiaires"
          >
            Les conventions
          </Link>
        </div>
        <div className="fr-grid-row fr-mb-4w">
          <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
            <div>
              <Doughnut
                backgroundColor={tableauDeBordViewModel.beneficiaire.graphique.backgroundColor}
                data={tableauDeBordViewModel.beneficiaire.details.map((detail) => detail.total)}
                isFull={false}
                labels={tableauDeBordViewModel.beneficiaire.details.map((detail) => detail.label)}
              />
            </div>
            <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>
              {tableauDeBordViewModel.beneficiaire.total}
            </div>
            <div className="fr-text--lg font-weight-700 fr-m-0">
              Bénéficiaires
            </div>
            <div className="color-blue-france">
              dont
              {' '}
              {tableauDeBordViewModel.beneficiaire.collectivite}
              {' '}
              collectivités
            </div>
          </div>
          <div className="fr-col">
            <div className="font-weight-500">
              Nombre de bénéficiaires par financements
            </div>
            <ul>
              {
                tableauDeBordViewModel.beneficiaire.details.map((detail) => (
                  <li
                    className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                    key={detail.label}
                  >
                    <div>
                      <Dot color={detail.color} />
                      {' '}
                      {detail.label}
                    </div>
                    <div className="font-weight-700">
                      {detail.total}
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        <p className="fr-grid-row background-info fr-p-3w">
          <InformationLogo />
          Un bénéficiaire peut cumuler plusieurs financements.
        </p>
      </section>
      <section
        aria-labelledby="aidantsMediateurs"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-3w fr-mb-3w separator">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="group-line" />
            <div>
              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="aidantsMediateurs"
              >
                Aidants et médiateurs numériques
              </h2>
              <p className="fr-m-0 font-weight-500">
                Chiffres clés sur les médiateurs de l’inclusion numérique
              </p>
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href="/aidants-et-mediateurs"
          >
            Les aidants et médiateurs
          </Link>
        </div>
        <div className="fr-grid-row fr-mb-3w fr-pb-3w separator">
          <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
            <div>
              <Doughnut
                backgroundColor={tableauDeBordViewModel.mediateur.graphique.backgroundColor}
                data={tableauDeBordViewModel.mediateur.details.map((detail) => detail.total)}
                isFull={false}
                labels={tableauDeBordViewModel.mediateur.details.map((detail) => detail.label)}
              />
            </div>
            <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>
              {tableauDeBordViewModel.mediateur.total}
            </div>
            <div className="fr-text--lg font-weight-700 fr-m-0">
              Médiateurs numériques
            </div>
          </div>
          <div className="fr-col">
            <div className="font-weight-500">
              Dont
            </div>
            <ul>
              {
                tableauDeBordViewModel.mediateur.details.map((detail) => (
                  <li
                    className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                    key={detail.label}
                  >
                    <div>
                      <Dot color={detail.color} />
                      {' '}
                      {detail.label}
                    </div>
                    <div className="font-weight-700">
                      {detail.total}
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
        <div className="fr-grid-row">
          <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
            <div>
              <Doughnut
                backgroundColor={tableauDeBordViewModel.aidant.graphique.backgroundColor}
                data={tableauDeBordViewModel.aidant.details.map((detail) => detail.total)}
                isFull={false}
                labels={tableauDeBordViewModel.aidant.details.map((detail) => detail.label)}
              />
            </div>
            <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>
              {tableauDeBordViewModel.aidant.total}
            </div>
            <div className="fr-text--lg font-weight-700 fr-m-0">
              Aidants numériques
            </div>
          </div>
          <div className="fr-col">
            <div className="font-weight-500">
              Dont
            </div>
            <ul>
              {
                tableauDeBordViewModel.aidant.details.map((detail) => (
                  <li
                    className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                    key={detail.label}
                  >
                    <div>
                      <Dot color={detail.color} />
                      {' '}
                      {detail.label}
                    </div>
                    <div className="font-weight-700">
                      {detail.total}
                    </div>
                  </li>
                ))
              }
            </ul>
          </div>
        </div>
      </section>
      <section
        aria-labelledby="sources"
        className="background-blue-france fr-mb-4w fr-py-4w fr-px-16w"
      >
        <h2
          className="fr-grid-row fr-grid-row--center fr-h4 color-blue-france fr-mb-2w"
          id="sources"
        >
          Sources et données utilisées
        </h2>
        <div className="fr-grid-row fr-grid-row--center fr-mb-2w">
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/coop.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/carto-nationale.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/aidants-connect.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/conum.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/mednum.svg`}
            width={50}
          />
          <Image
            alt=""
            className="fr-mr-2w"
            height={50}
            src={`${process.env.NEXT_PUBLIC_HOST}/data-inclusion.svg`}
            width={50}
          />
        </div>
        <p className="fr-grid-row fr-mb-2w">
          Gravida malesuada tellus cras eu risus euismod pellentesque viverra.
          Enim facilisi vitae sem mauris quis massa vulputate nunc.
          Blandit sed aenean ullamcorper diam. In donec et in duis magna.
        </p>
        <div className="fr-grid-row fr-grid-row--center">
          <ExternalLink
            className="color-blue-france"
            href="https://inclusion-numerique.anct.gouv.fr/en-savoir-plus-sur-les-donnees"
            title="Sources et données utilisées"
          >
            En savoir plus
          </ExternalLink>
        </div>
      </section>
    </>
  )
}

type Props = Readonly<{
  communeFragilite: Array<CommuneFragilite>
  tableauDeBordViewModel: TableauDeBordViewModel
}>
