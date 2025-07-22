'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import html2canvas from 'html2canvas'
import { ReactElement, useRef } from 'react'

import styles from './Gouvernances.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { FeuillesDeRouteDeposeesViewModel } from '@/presenters/tableauDeBord/feuillesDeRouteDeposeesPresenter'

export default function FeuillesDeRouteDeposees({ 
  dateGeneration,
  feuillesDeRouteDeposees,
}: Props): ReactElement {
  ChartJS.register(ArcElement, Tooltip)

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
            link.download = 'feuilles-de-route-deposees.png'
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
      aria-labelledby="feuilles-de-route-deposees"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >      
      <div
        className="center"
        ref={componentRef}
      >
        <div>
          <Doughnut
            backgroundColor={doughnutItems.map(item => item.backgroundColor)}
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
          <strong>
            {feuillesDeRouteDeposees.nombreTotal - feuillesDeRouteDeposees.sansDemandeSubvention.count}
            {' '}
            avec demandes de subvention
          </strong>
        </div>
        <div className="fr-mt-4w">
          <ul>
            {allItems.map((item) => (
              <li
                className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                key={item.perimetre}
              >
                <div
                  className={styles['text-ellipsis']}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <span className={styles['dot-margin']}>
                    <Dot color={item.color} />
                  </span>
                  <span className={styles['item-type-padding']}>
                    {item.perimetre}
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
        <div>
          <button
            className={`fr-btn fr-btn--tertiary fr-btn--icon-only fr-icon-download-line fr-icon--xs ${styles['download-button']}`}
            onClick={handleDownload}
            style={{ 
              alignItems: 'center',
              border: '1px solid var(--border-default-grey)',
              color: 'var(--text-mention-grey)',
              display: 'flex',
              height: '32px',
              justifyContent: 'center',
              minHeight: '32px',
              width: '32px',
            }}
            title="Télécharger le graphique"
            type="button"
          >
            <span className="fr-sr-only">
              Télécharger le graphique
            </span>
          </button>
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
  dateGeneration: Date
  feuillesDeRouteDeposees: ErrorViewModel | FeuillesDeRouteDeposeesViewModel
}>