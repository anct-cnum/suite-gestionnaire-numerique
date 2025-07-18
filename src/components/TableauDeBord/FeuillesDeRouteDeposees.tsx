'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import { ReactElement } from 'react'

import styles from './TableauDeBord.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FeuillesDeRouteDeposeesViewModel } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'

export default function FeuillesDeRouteDeposees({ 
  feuillesDeRouteDeposees,
}: Props): ReactElement {
  ChartJS.register(ArcElement, Tooltip)

  // Conversion des classes CSS vers les couleurs pour le graphique Doughnut
  function getBackgroundColor(cssClass: string): string {
    const colorMappings: Record<string, string> = {
      'dot-green-archipel-main-648': '#00A95F',
      'dot-green-emeraude-main-632': '#00AC8C',
      'dot-green-menthe-main-548': '#009081',
      'dot-green-tilleul-verveine-main-707': '#B8E986',
      'dot-grey-sans-coporteur': '#929292',
    }
    return colorMappings[cssClass] ?? '#929292'
  }

  if (isErrorViewModel(feuillesDeRouteDeposees)) {
    return (
      <section
        aria-labelledby="feuilles-de-route-deposees"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <TitleIcon
              background="white"
              icon="error-warning-line"
            />
            <div className="fr-text--sm color-blue-france fr-mt-2w">
              {feuillesDeRouteDeposees.message}
            </div>
          </div>
        </div>
      </section>
    )
  }

  // Items pour le graphique Doughnut - seulement la ventilation par périmètre
  const doughnutItems = feuillesDeRouteDeposees.ventilationParPerimetre

  // Items pour la liste - exclut 'Sans demande de subvention' et 'Autre'
  const allItems = feuillesDeRouteDeposees.ventilationParPerimetre.filter(
    item => item.perimetre !== 'Autre'
  )

  return (
    <section
      aria-labelledby="feuilles-de-route-deposees"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >
      
      <div className="center">
        <div>
          <Doughnut
            backgroundColor={doughnutItems.map(item => getBackgroundColor(item.color))}
            data={doughnutItems.map(item => item.count)}
            isFull={false}
            labels={doughnutItems.map(item => item.perimetre)}
          />
        </div>
        <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>
          {feuillesDeRouteDeposees.nombreTotal}
        </div>
        <div className="fr-text--lg font-weight-700 fr-m-0">
          Feuilles de route
        </div>
        <div className="color-blue-france fr-pb-4w separator">
          dont
          {' '}
          {feuillesDeRouteDeposees.nombreTotal - feuillesDeRouteDeposees.sansDemandeSubvention.count}
          {' '}
          avec demande de subvention
        </div>
        <div className="fr-mt-4w">
          <ul>
            {allItems.map((item) => (
              <li
                className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                key={item.perimetre}
              >
                <div>
                  <Dot color={item.color} />
                  {' '}
                  {item.perimetre}
                </div>
                <div className="font-weight-700">
                  {item.count}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}

function isErrorViewModel(
  viewModel: ErrorViewModel | FeuillesDeRouteDeposeesViewModel
): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  feuillesDeRouteDeposees: ErrorViewModel | FeuillesDeRouteDeposeesViewModel
}>