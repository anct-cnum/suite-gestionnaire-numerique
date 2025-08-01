import Link from 'next/link'
import { ReactElement } from 'react'

import VentilationFinancements from './VentilationFinancements'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FinancementAdminViewModel } from '@/presenters/tableauDeBord/financementAdminPresenter'

export default function FinancementsAdmin({ financementViewModel, lienFinancements }: Props): ReactElement {
  if (isErrorViewModel(financementViewModel)) {
    return (
      <section
        aria-labelledby="financementss"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="pen-nib-line" />
            <div>
              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="financements"
              >
                Financements
              </h2>
              <p
                className="fr-m-0 fr-text--md"
                style={{ fontWeight: 500 }}
              >
                Chiffres clés des enveloppes de financement
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
              {financementViewModel.message}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="financements"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="pen-nib-line" />
          <div>
            <h2
              className="fr-h4 color-blue-france fr-m-0"
              id="financements"
            >
              Financements
            </h2>
            <p
              className="fr-m-0 fr-text--md"
              style={{ fontWeight: 500 }}
            >
              Chiffres clés des enveloppes de financement
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
              icon="download-line"
            />
            {financementViewModel.montantTotalEnveloppes}
          </div>
          <div
            className="fr-text--md fr-grid-row fr-grid-row--middle"
            style={{ fontWeight: 500 }}
          >
            Montant global des enveloppes
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            Sur
            {' '}
            <span style={{ fontWeight: 700 }}>
              {financementViewModel.nombreEnveloppes}
              {' '}
              enveloppes de financement
            </span>
          </div>
        </div>
        <div className="fr-col background-blue-france fr-p-4w">
          <div className="fr-h1 fr-m-0">
            <TitleIcon
              background="white"
              icon="upload-line"
            />
            {financementViewModel.creditsEngages}
          </div>
          <div
            className="fr-text--md fr-grid-row fr-grid-row--middle"
            style={{ fontWeight: 500 }}
          >
            Crédits engagés par l&apos;État
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            Sur
            {' '}
            <span style={{ fontWeight: 700 }}>
              {financementViewModel.nombreEnveloppesUtilisees}
              {' '}
              enveloppes de financement
            </span>
          </div>
        </div>
      </div>
      <VentilationFinancements
        contexte="admin"
        nombreDeFinancementsEngagesParLEtat={financementViewModel.nombreDeFinancementsEngagesParLEtat}
        ventilationSubventionsParEnveloppe={financementViewModel.ventilationSubventionsParEnveloppe}
      />
    </section>
  )
}

function isErrorViewModel(viewModel: ErrorViewModel | FinancementAdminViewModel): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  financementViewModel: ErrorViewModel | FinancementAdminViewModel
  lienFinancements: string
}>