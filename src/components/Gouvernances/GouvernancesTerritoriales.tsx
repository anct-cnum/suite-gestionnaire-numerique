'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import html2canvas from 'html2canvas'
import { ReactElement, useRef } from 'react'

import styles from './Gouvernances.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import { DownloadButton } from '../shared/Download/DownloadButton'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { GouvernancesTerritorialesViewModel } from '@/presenters/tableauDeBord/gouvernancesTerritorialesPresenter'

export default function GouvernancesTerritoriales({ 
  dateGeneration,
  gouvernancesTerritoriales,
}: Props): ReactElement {
  ChartJS.register(ArcElement, Tooltip)

  if (isErrorViewModel(gouvernancesTerritoriales)) {
    return (
      <section
        aria-labelledby="gouvernances-territoriales"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
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
        backgroundColor: gouvernancesTerritoriales.sansCoporteur.backgroundColor,
        color: gouvernancesTerritoriales.sansCoporteur.color,
        count: gouvernancesTerritoriales.sansCoporteur.count,
        type: gouvernancesTerritoriales.sansCoporteur.label,
      }]
      : [],
    
  ]

  const componentRef = useRef<HTMLDivElement>(null)

  async function handleDownload(): Promise<void> {
    if (componentRef.current) {
      try {
        const canvas = await html2canvas(componentRef.current, {
          backgroundColor: '#ffffff',
          scale: 2, // Pour une meilleure qualité
        })
        
        // Convertir en blob et télécharger
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.download = 'gouvernances-territoriales.png'
            link.href = url
            link.click()
            URL.revokeObjectURL(url)
          }
        })
      } catch {
        // Erreur silencieuse pour l'utilisateur
      }
    }
  }

  return (
    <section
      aria-labelledby="gouvernances-territoriales"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >      
      <div
        className="center"
        ref={componentRef}
      >
        <div>
          <Doughnut
            backgroundColor={allItems.map(item => item.backgroundColor)}
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
        <div className="color-blue-france fr-pb-4w separator">
          dont
          {' '}
          <strong>
            {gouvernancesTerritoriales.nombreTotal - gouvernancesTerritoriales.sansCoporteur.count}
            {' '}
            co-portées
          </strong>
        </div>
        <div className="fr-mt-4w">
          <ul>
            {allItems.map((item) => (
              <li
                className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                key={item.type}
              >
                <div
                  className={styles['text-ellipsis']}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <span className={styles['dot-margin']}>
                    <Dot color={item.color} />
                  </span>
                  <span className={styles['item-type-padding']}>
                    {item.type}
                  </span>
                </div>
                <div
                  className="font-weight-700"
                  style={{ flexShrink: 0 }}
                >
                  {item.count}
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <hr className="fr-hr fr-mt-3w" />
      <div
        className="fr-grid-row fr-grid-row--middle fr-mt-2w"
        style={{ alignItems: 'center' }}
      >
        <div style={{ flex: 1 }}>
          <p className="fr-text--sm fr-mb-0">
            Données mises à jour le
            {' '}
            {dateGeneration.toLocaleDateString('fr-FR')}
          </p>
        </div>
        <DownloadButton 
          onClick={handleDownload}
          title="Gouvernances territoriales"
        />
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
  dateGeneration: Date
  gouvernancesTerritoriales: ErrorViewModel | GouvernancesTerritorialesViewModel
}>