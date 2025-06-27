import Link from 'next/link'
import { ReactElement } from 'react'

import Dot from '../shared/Dot/Dot'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FinancementViewModel } from '@/presenters/tableauDeBord/financementPresenter'

export default function Financements({ conventionnement, lienFinancements }: Props) : ReactElement {
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
              <p className="fr-m-0 font-weight-500">
                Chiffres clés des budgets et financements
              </p>
            </div>
          </div>
          <Link
            className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
            href={lienFinancements}
          >
            Les demandes
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
            <p className="fr-m-0 font-weight-500">
              Chiffres clés des budgets et financements
            </p>
          </div>
        </div>
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
          href={lienFinancements}
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
            {conventionnement.budget.total}
          </div>
          <div className="font-weight-500 fr-grid-row fr-grid-row--middle">
            Budget global renseigné
            {' '}
            <span
              aria-hidden="true"
              className="fr-icon-question-line fr-ml-1w"
              title="Somme des budgets globaux renseignés pour chaque action de vos feuilles de route"
            />
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            pour
            {' '}
            <span className="font-weight-700">
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
          <div className="font-weight-500 fr-grid-row fr-grid-row--middle">
            Financements engagés par l&apos;État
            {' '}
            <span
              aria-hidden="true"
              className="fr-icon-question-line fr-ml-1w"
              title="Somme des financements accordés par l&apos;État pour vos actions"
            />
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            Soit
            {' '}
            <span className="font-weight-700">
              {conventionnement.credit.pourcentage}
              {' '}
              % de votre budget global
            </span>
          </div>
        </div>
      </div>
      <div className="font-weight-500 fr-grid-row fr-grid-row--middle fr-mb-3w">
        {conventionnement.nombreDeFinancementsEngagesParLEtat}
        {' '}
        financement(s) engagé(s) par l&apos;État
        <span
          aria-hidden="true"
          className="fr-icon-question-line fr-ml-1w"
          title="Nombre total de demandes de financement ayant reçu un accord de l&apos;État. Ci-dessous la répartition par enveloppe."
        />
      </div>
      <ul>
        {
          conventionnement.ventilationSubventionsParEnveloppe.map((detail) => (
            <li
              className="fr-grid-row fr-btns-group--space-between fr-mb-1w fr-mt-1w"
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
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | FinancementViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  conventionnement: ErrorViewModel | FinancementViewModel
  lienFinancements: string
}>
