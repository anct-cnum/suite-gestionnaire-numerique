'use client'

import { ArcElement, BarElement, CategoryScale, Chart as ChartJS, LinearScale, Tooltip } from 'chart.js'
import Image from 'next/image'
import Link from 'next/link'
import { ReactElement, useContext } from 'react'

import EtatDesLieux from './EtatDesLieux/EtatDesLieux'
import Financements from './Financements'
import Gouvernance from './Gouvernance/Gouvernance'
import styles from './TableauDeBord.module.css'
import { clientContext } from '../shared/ClientContext'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import ExternalLink from '../shared/ExternalLink/ExternalLink'
import InformationLogo from '../shared/InformationLogo/InformationLogo'
import PageTitle from '../shared/PageTitle/PageTitle'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsRealisesViewModel } from '@/presenters/tableauDeBord/accompagnementsRealisesPresenter'
import { FinancementViewModel } from '@/presenters/tableauDeBord/financementPresenter'
import { GouvernanceViewModel } from '@/presenters/tableauDeBord/gouvernancePresenter'
import { CommuneFragilite } from '@/presenters/tableauDeBord/indiceFragilitePresenter'
import { LieuxInclusionNumeriqueViewModel } from '@/presenters/tableauDeBord/lieuxInclusionNumeriquePresenter'
import { MediateursEtAidantsViewModel } from '@/presenters/tableauDeBord/mediateursEtAidantsPresenter'
import { TableauDeBordViewModel } from '@/presenters/tableauDeBord/tableauDeBordPresenter'

export default function TableauDeBord({
  accompagnementsRealisesViewModel,
  departement,
  financementsViewModel,
  gouvernanceViewModel,
  indicesFragilite,
  lieuxInclusionViewModel,
  mediateursEtAidantsViewModel,
  tableauDeBordViewModel,
}: Props): ReactElement {
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
          Bienvenue sur l&apos;outil de pilotage de l&apos;Inclusion Numérique ·
          {' '}
          {departement}
        </span>
      </PageTitle>
      <section
        aria-labelledby="taches"
        className={`fr-mb-4w ${styles.hidden}`}
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
      <hr className="fr-hr" />
      <EtatDesLieux
        accompagnementsRealisesViewModel={accompagnementsRealisesViewModel}
        lieuxInclusionViewModel={lieuxInclusionViewModel}
        mediateursEtAidantsViewModel={mediateursEtAidantsViewModel}
        territoire={{
          codeDepartement: departement,
          indicesFragilite: indicesFragilite as Array<CommuneFragilite>,
          type: 'Departement',
        }}
      /> 
      <Gouvernance
        gouvernanceViewModel={gouvernanceViewModel}
        lienGouvernance={tableauDeBordViewModel.liens.gouvernance}
      />
      <Financements
        conventionnement={financementsViewModel}
        lienFinancements={tableauDeBordViewModel.liens.financements}
      />
      <section
        aria-labelledby="beneficiaires"
        className={`fr-mb-4w grey-border border-radius fr-p-4w ${styles.hidden}`}
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
            href={tableauDeBordViewModel.liens.beneficiaires}
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
        className={`fr-mb-4w grey-border border-radius fr-p-4w ${styles.hidden}`}
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
                Chiffres clés sur les médiateurs de l&apos;inclusion numérique
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
        className={`background-blue-france fr-mb-4w fr-py-4w fr-px-16w ${styles.hidden}`}
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
  accompagnementsRealisesViewModel: AccompagnementsRealisesViewModel | ErrorViewModel
  departement: string
  financementsViewModel: ErrorViewModel | FinancementViewModel
  gouvernanceViewModel: ErrorViewModel | GouvernanceViewModel
  indicesFragilite: Array<CommuneFragilite> | ErrorViewModel
  lieuxInclusionViewModel: ErrorViewModel | LieuxInclusionNumeriqueViewModel
  mediateursEtAidantsViewModel: ErrorViewModel | MediateursEtAidantsViewModel
  tableauDeBordViewModel: TableauDeBordViewModel
}>
