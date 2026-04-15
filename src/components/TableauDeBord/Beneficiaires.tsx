'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import BlocCard from './BlocCard'
import styles from './TableauDeBord.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import InformationLogo from '../shared/InformationLogo/InformationLogo'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { BeneficiairesViewModel } from '@/presenters/tableauDeBord/beneficiairesPresenter'

export default function Beneficiaires({ beneficiairesViewModel, lienBeneficiaires }: Props): ReactElement {
  if ('type' in beneficiairesViewModel) {
    return (
      <BlocCard labelledBy="beneficiaires">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="community-line" size="medium-large" />
          <h2 className="fr-h4 color-blue-france fr-m-0" id="beneficiaires">
            Bénéficiaires de financements
          </h2>
        </div>
        <div className="fr-alert fr-alert--error fr-mt-3w" role="alert">
          <p className="fr-alert__title">Erreur</p>
          <p>{beneficiairesViewModel.message}</p>
        </div>
      </BlocCard>
    )
  }

  const viewModel = beneficiairesViewModel

  return (
    <BlocCard labelledBy="beneficiaires">
      <div className="fr-grid-row fr-grid-row--top space-between separator fr-pb-3w fr-mb-3w">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="community-line" size="medium-large" />
          <div>
            <h2 className="fr-h4 color-blue-france fr-m-0" id="beneficiaires">
              Bénéficiaires de financements
            </h2>
            <p className="fr-m-0 font-weight-500">Chiffres clés sur les bénéficiaires de financements</p>
          </div>
        </div>
        <Link className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line" href={lienBeneficiaires}>
          Les conventions
        </Link>
      </div>
      <div className="fr-grid-row fr-mb-4w">
        <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
          <div className={styles['demi-doughnut']}>
            <Doughnut
              backgroundColor={viewModel.graphique.backgroundColor}
              data={viewModel.details.map((detail) => detail.total)}
              isFull={false}
              labels={viewModel.details.map((detail) => detail.label)}
            />
          </div>
          <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>{viewModel.total}</div>
          <div className="fr-text--lg font-weight-700 fr-m-0">Bénéficiaires</div>
          {viewModel.collectivite > 0 && (
            <div className="color-blue-france">dont {viewModel.collectivite} collectivités</div>
          )}
        </div>
        <div className="fr-col">
          <div className="fr-text--md fr-mb-2w font-weight-500">Nombre de bénéficiaires par financements</div>
          <ul>
            {viewModel.details.map((detail) => (
              <li className="fr-mb-1w fr-mt-1w" key={detail.label} style={{ listStyle: 'none' }}>
                <div className="fr-text--sm fr-grid-row fr-grid-row--middle">
                  <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <Dot className="fr-mr-1w" color={detail.color} /> {detail.label}
                  </div>
                  <div
                    style={{
                      fontWeight: 700,
                      marginLeft: '1rem',
                      marginRight: '1rem',
                      minWidth: '3rem',
                      textAlign: 'right',
                    }}
                  >
                    {detail.total}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="fr-grid-row background-info fr-p-3w">
        <InformationLogo />
        Un bénéficiaire peut cumuler plusieurs financements.
      </p>
    </BlocCard>
  )
}

type Props = Readonly<{
  beneficiairesViewModel: BeneficiairesViewModel | ErrorViewModel
  lienBeneficiaires: string
}>
