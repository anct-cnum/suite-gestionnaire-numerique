import Link from 'next/link'
import { ReactElement } from 'react'

import VentilationFinancements from './VentilationFinancements'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FinancementViewModel } from '@/presenters/tableauDeBord/financementPrefPresenter'

export default function FinancementsPref({ conventionnement, lienFinancements }: Props): ReactElement {
  if (isErrorViewModel(conventionnement)) {
    return (
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
                Financements
              </h2>
              <p
                className="fr-m-0 fr-text--md"
                style={{ fontWeight: 500 }}
              >
                Chiffres clés des budgets et financements
              </p>
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href={lienFinancements}
          >
            Les demandes en cours
          </Link>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <TitleIcon
              background="white"
              icon="error-warning-line"
            />
            <div className="fr-text--sm color-blue-france fr-mt-2w">
              {conventionnement.message}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
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
              Financements
            </h2>
            <p
              className="fr-m-0 fr-text--md"
              style={{ fontWeight: 500 }}
            >
              Chiffres clés des budgets et financements
            </p>
          </div>
        </div>
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
          href={lienFinancements}
        >
          Les demandes en cours
        </Link>
      </div>
      <div className="fr-grid-row fr-mb-4w">
        <div className="fr-col background-blue-france fr-p-4w fr-mr-4w">
          <div className="fr-h1 fr-m-0">
            <TitleIcon
              background="white"
              icon="money-euro-circle-line"
            />
            {conventionnement.budget.total}
          </div>
          <div
            className="fr-text--md fr-grid-row fr-grid-row--middle"
            style={{ fontWeight: 500 }}
          >
            Budget global renseigné
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            pour
            {' '}
            <span style={{ fontWeight: 700 }}>
              {conventionnement.budget.feuillesDeRouteWording}
            </span>
          </div>
        </div>
        <div className="fr-col background-blue-france fr-p-4w">
          <div className="fr-h1 fr-m-0">
            <TitleIcon
              background="white"
              icon="download-line"
            />
            {conventionnement.credit.total}
          </div>
          <div
            className="fr-text--md fr-grid-row fr-grid-row--middle"
            style={{ fontWeight: 500 }}
          >
            Financements engagés par l&apos;État
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            Soit
            {' '}
            <span style={{ fontWeight: 700 }}>
              {conventionnement.credit.pourcentage}
              {' '}
              % de votre budget global renseigné
            </span>
          </div>
        </div>
      </div>
      <VentilationFinancements
        contexte="departement"
        nombreDeFinancementsEngagesParLEtat={conventionnement.nombreDeFinancementsEngagesParLEtat}
        ventilationSubventionsParEnveloppe={conventionnement.ventilationSubventionsParEnveloppe}
      />
    </section>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | FinancementViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  conventionnement: ErrorViewModel | FinancementViewModel
  lienFinancements: string
}>