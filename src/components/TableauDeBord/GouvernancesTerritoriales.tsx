'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import { ReactElement } from 'react'

import styles from './TableauDeBord.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernancesTerritorialesViewModel } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'

export default function GouvernancesTerritoriales({ 
  gouvernancesTerritoriales,
}: Props): ReactElement {
  ChartJS.register(ArcElement, Tooltip)

  // Conversion des classes CSS vers les couleurs pour le graphique Doughnut
  function getBackgroundColor(cssClass: string): string {
    const colorMappings: Record<string, string> = {
      'dot-black': '#000000',
      'dot-blue-france-main-525': '#000091',
      'dot-green-menthe-main-548': '#009081',
      'dot-green-tilleul-verveine-850': '#8db836',
      'dot-green-tilleul-verveine-925': '#b9d15e',
      'dot-green-tilleul-verveine-950': '#5a7d2e',
      'dot-grey-sans-coporteur': '#929292',
      'dot-orange-terre-battue-850-200': '#e17b47',
      // Pink colors
      'dot-pink-macaron-850-200': '#f5b7c7',
      'dot-pink-macaron-925-125': '#fad7e1',
      'dot-pink-macaron-950-100': '#fce9ed',
      'dot-pink-macaron-975-75': '#fef4f6',
      'dot-pink-macaron-main-689': '#e18b96',
      'dot-pink-tuile-850-200': '#e8a598',
      'dot-pink-tuile-925-125': '#f3d2ca',
      'dot-pink-tuile-950-100': '#f9e9e5',
      'dot-pink-tuile-975-75': '#fcf4f2',
      'dot-pink-tuile-main-556': '#ce614a',
      // Purple colors
      'dot-purple-glycine-100-950': '#e8d5f5',
      'dot-purple-glycine-200-850': '#d1aaea',
      'dot-purple-glycine-850-200': '#b19dd1',
      'dot-purple-glycine-925-125': '#c4a9d8',
      'dot-purple-glycine-950-100': '#c4a9d8',
      'dot-purple-glycine-975-75': '#f5f0fc',
      'dot-purple-glycine-main-494': '#8b5fb4',
      'dot-purple-glycine-main-732': '#6a4c93',
      'dot-purple-glycine-sun-113-moon-797': '#d4c5e8',
    }
    return colorMappings[cssClass] ?? '#929292'
  }

  if (isErrorViewModel(gouvernancesTerritoriales)) {
    return (
      <section
        aria-labelledby="gouvernances-territoriales"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-2w">
          <div className="fr-grid-row fr-grid-row--middle">
            <TitleIcon icon="government-line" />
            <div>
              <h2
                className="fr-h4 color-blue-france fr-m-0"
                id="gouvernances-territoriales"
              >
                Gouvernances territoriales
              </h2>
              <p className="fr-m-0 font-weight-500">
                Répartition des gouvernances par type de coporteur
              </p>
            </div>
          </div>
        </div>
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <TitleIcon
              background="white"
              icon="error-warning-line"
            />
            <div className="fr-text--sm color-blue-france fr-mt-2w">
              {gouvernancesTerritoriales.message}
            </div>
          </div>
        </div>
      </section>
    )
  }

  const allItems = [
    ...gouvernancesTerritoriales.ventilationParTypeDeCoporteur,
    ...gouvernancesTerritoriales.sansCoporteur.count > 0 
      ? [{
        color: gouvernancesTerritoriales.sansCoporteur.color,
        count: gouvernancesTerritoriales.sansCoporteur.count,
        type: gouvernancesTerritoriales.sansCoporteur.label,
      }]
      : [],
    
  ]

  return (
    <section
      aria-labelledby="gouvernances-territoriales"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >
      <div className="fr-grid-row fr-grid-row--middle space-between fr-pb-3w fr-mb-3w separator">
        <div className="fr-grid-row fr-grid-row--middle">
          <TitleIcon icon="government-line" />
          <div>
            <h2
              className="fr-h4 color-blue-france fr-m-0"
              id="gouvernances-territoriales"
            >
              Gouvernances territoriales
            </h2>
            <p className="fr-m-0 font-weight-500">
              Répartition des gouvernances par type de coporteur
            </p>
          </div>
        </div>
      </div>
      
      <div className="fr-grid-row fr-mb-4w">
        <div className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}>
          <div>
            <Doughnut
              backgroundColor={allItems.map(item => getBackgroundColor(item.color))}
              data={allItems.map(item => item.count)}
              isFull={false}
              labels={allItems.map(item => item.type)}
            />
          </div>
          <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>
            {gouvernancesTerritoriales.nombreTotal}
          </div>
          <div className="fr-text--lg font-weight-700 fr-m-0">
            Gouvernances territoriales
          </div>
          <div className="color-blue-france">
            dont
            {' '}
            {gouvernancesTerritoriales.nombreTotal - gouvernancesTerritoriales.sansCoporteur.count}
            {' '}
            avec coporteur(s)
          </div>
        </div>
        <div className="fr-col">
          <div className="font-weight-500">
            Ventilation par type de coporteur
          </div>
          <ul>
            {allItems.map((item) => (
              <li
                className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                key={item.type}
              >
                <div>
                  <Dot color={item.color} />
                  {' '}
                  {item.type}
                </div>
                <div className="font-weight-700">
                  {item.count}
                  {' '}
                  {item.type === 'Sans coporteur' ? 'gouvernance' : 'membre'}
                  {item.count > 1 ? 's' : ''}
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
  viewModel: ErrorViewModel | GouvernancesTerritorialesViewModel
): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  gouvernancesTerritoriales: ErrorViewModel | GouvernancesTerritorialesViewModel
}>