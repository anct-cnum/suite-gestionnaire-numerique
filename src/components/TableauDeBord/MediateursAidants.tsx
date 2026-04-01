'use client'

import Link from 'next/link'
import { ReactElement } from 'react'

import BlocCard from './BlocCard'
import styles from './TableauDeBord.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import TitleIcon from '../shared/TitleIcon/TitleIcon'

export default function MediateursAidants({ viewModel }: Props): ReactElement {
  return (
    <BlocCard labelledBy="mediateursAidants">
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-3w fr-mb-3w separator">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="group-line" size="medium-large" />
          <div>
            <h2 className="fr-h4 color-blue-france fr-m-0" id="mediateursAidants">
              Médiateurs numériques et Aidants Connect
            </h2>
            <p className="fr-m-0 font-weight-500">
              Chiffres clés des médiateurs numériques et Aidants Connect identifiés sur le territoire
            </p>
          </div>
        </div>
        <Link
          className="fr-btn fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-right-line"
          href="/aidants-et-mediateurs"
        >
          Les médiateurs
        </Link>
      </div>
      <div className="fr-grid-row">
        <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
          <div>
            <Doughnut
              backgroundColor={viewModel.graphique.backgroundColor}
              data={viewModel.details.map((detail) => detail.total)}
              isFull={false}
              labels={viewModel.details.map((detail) => detail.label)}
            />
          </div>
          <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>{viewModel.total}</div>
          <div className="fr-text--lg font-weight-700 fr-m-0">Médiateurs numériques</div>
        </div>
        <div className="fr-col">
          <div className="font-weight-500 fr-mt-1v">Dont</div>
          <ul>
            {viewModel.details.map((detail) => (
              <li className="fr-grid-row fr-btns-group--space-between fr-mb-1w" key={detail.label}>
                <div>
                  <Dot color={detail.color} /> {detail.label}
                </div>
                <div className="font-weight-700">{detail.total}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </BlocCard>
  )
}

export type MediateursAidantsViewModel = Readonly<{
  details: ReadonlyArray<
    Readonly<{
      color: string
      label: string
      total: number
    }>
  >
  graphique: Readonly<{
    backgroundColor: ReadonlyArray<string>
  }>
  total: number
}>

type Props = Readonly<{
  viewModel: MediateursAidantsViewModel
}>
