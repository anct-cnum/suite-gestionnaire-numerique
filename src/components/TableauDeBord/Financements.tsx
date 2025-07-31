import Link from 'next/link'
import { ReactElement } from 'react'

import Dot from '../shared/Dot/Dot'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import Information from '@/components/shared/Information/Information'
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
            <p className="fr-m-0 font-weight-500">
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
          <div className="font-weight-500 fr-grid-row fr-grid-row--middle">
            Budget global renseigné
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
          </div>
          <div className="fr-text--xs color-blue-france fr-mb-0">
            Soit
            {' '}
            <span className="font-weight-700">
              {conventionnement.credit.pourcentage}
              {' '}
              % de votre budget global renseigné
            </span>
          </div>
        </div>
      </div>
      <div className="font-weight-500 fr-grid-row fr-grid-row--middle fr-mb-3w">
        {conventionnement.nombreDeFinancementsEngagesParLEtat}
        {' '}
        financement(s) engagé(s) par l&apos;État
        <Information label="Nombre de demandes de subventions validées des feuilles de route de votre gouvernance" />
      </div>
      <ul>
        {
          conventionnement.ventilationSubventionsParEnveloppe.map((detail) => (
            <li
              className="fr-mb-2w fr-mt-1w"
              key={detail.label}
              style={{ listStyle: 'none' }}
            >
              <div className="fr-grid-row fr-grid-row--middle">
                <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                  <Dot color={detail.color} />
                  {' '}
                  {detail.label}
                </div>
                <div 
                  className="font-weight-700" 
                  style={{ marginLeft: '1rem', marginRight: '1rem', minWidth: '3rem', textAlign: 'right' }}
                >
                  {detail.total}
                </div>
                {conventionnement.contexte === 'admin' && (
                  <div 
                    style={{ position: 'relative', width: '6.25rem' }}
                    title={`${detail.pourcentageConsomme}% de l'enveloppe consommée`}
                  >
                    <div style={{ backgroundColor: 'var(--grey-900-175)', borderRadius: '4px', height: '8px', width: '100%' }}>
                      <div 
                        style={{ 
                          backgroundColor: 'var(--blue-france-main-525)',
                          borderRadius: '4px',
                          height: '8px',
                          transition: 'width 0.3s ease',
                          width: `${detail.pourcentageConsomme}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
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
