'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import TitleIcon from '../../shared/TitleIcon/TitleIcon'
import styles from '../TableauDeBord.module.css'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernanceViewModel } from '@/presenters/tableauDeBord/gouvernancePrefPresenter'

export default function GouvernancePref({
  gouvernanceViewModel,
  lienGouvernance,
}: Props): ReactElement {
  if (isErrorViewModel(gouvernanceViewModel)) {
    return (
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
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href={lienGouvernance}
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
              -
            </div>
            <div
              className="fr-text--md fr-mb-0"
              style={{ fontWeight: 500 }}
            >
              Membres de la gouvernance
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              Erreur lors du chargement des données
            </div>
          </div>
          <div className="fr-col background-blue-france fr-p-4w fr-mr-4w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="community-line"
              />
              -
            </div>
            <div className="font-weight-500">
              Collectivité impliquées
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              Erreur lors du chargement des données
            </div>
          </div>
          <div className="fr-col background-blue-france fr-p-4w">
            <div className="fr-h1 fr-m-0">
              <TitleIcon
                background="white"
                icon="file-download-line"
              />
              -
            </div>
            <div className="font-weight-500">
              Feuilles de route déposées
            </div>
            <div className="fr-text--xs color-blue-france fr-mb-0">
              Erreur lors du chargement des données
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
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
          </div>
        </div>
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
          href={lienGouvernance}
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
            {gouvernanceViewModel.membre.total}
          </div>
          <div
            className="fr-text--md fr-mb-0"
            style={{ fontWeight: 500 }}
          >
            Membres de la gouvernance
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            dont
            {' '}
            <span style={{ fontWeight: 700 }}>
              {gouvernanceViewModel.membre.coporteur}
              {' '}
              coporteurs
            </span>
          </div>
        </div>
        <div className={`fr-col background-blue-france fr-p-4w fr-mr-4w ${styles.hidden}`}>
          <div className="fr-h1 fr-m-0">
            <TitleIcon
              background="white"
              icon="community-line"
            />
            {gouvernanceViewModel.collectivite.total}
          </div>
          <div
            className="fr-text--md fr-mb-0"
            style={{ fontWeight: 500 }}
          >
            Collectivité impliquées
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            sur les
            {' '}
            <span style={{ fontWeight: 700 }}>
              {gouvernanceViewModel.collectivite.membre}
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
            {gouvernanceViewModel.feuilleDeRoute.total}
          </div>
          <div
            className="fr-text--md fr-mb-0"
            style={{ fontWeight: 500 }}
          >
            Feuilles de route déposées
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            comprenant
            {' '}
            <span style={{ fontWeight: 700 }}>
              {gouvernanceViewModel.feuilleDeRoute.action}
              {' '}
              actions enregistrées
            </span>
          </div>
        </div>
      </div>
    </section>
  )
}

type Props = Readonly<{
  gouvernanceViewModel: ErrorViewModel | GouvernanceViewModel
  lienGouvernance: string
}>

function isErrorViewModel(viewModel: ErrorViewModel | GouvernanceViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}
