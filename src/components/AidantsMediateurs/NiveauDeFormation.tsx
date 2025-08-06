'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import html2canvas from 'html2canvas'
import { ReactElement, useRef } from 'react'

import gouvernancesStyles from '../Gouvernances/Gouvernances.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import InformationLogo from '../shared/InformationLogo/InformationLogo'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import styles from '../TableauDeBord/TableauDeBord.module.css'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { NiveauDeFormationViewModel } from '@/presenters/tableauDeBord/niveauDeFormationPresenter'

export default function NiveauDeFormation({
  dateGeneration,
  niveauDeFormation,
}: Props): ReactElement {
  ChartJS.register(ArcElement, Tooltip)

  const componentRef = useRef<HTMLDivElement>(null)

  async function handleDownload(): Promise<void> {
    if (componentRef.current) {
      try {
        const canvas = await html2canvas(componentRef.current, {
          backgroundColor: '#ffffff',
          scale: 2,
        })
        
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.download = 'niveau-de-formation.png'
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

  if (isErrorViewModel(niveauDeFormation)) {
    return (
      <section
        aria-labelledby="niveau-de-formation"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <TitleIcon
              background="white"
              icon="error-warning-line"
            />
            <div className="fr-text--sm color-blue-france fr-mt-2w">
              {niveauDeFormation.message}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="niveau-de-formation"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >
      <div className="fr-grid-row fr-grid-row--middle separator fr-pb-3w fr-mb-3w">
        <div>
          <h2
            className="fr-h4 color-blue-france fr-m-0"
            id="niveau-de-formation"
          >
            Niveau de formation des aidants et médiateurs numériques
          </h2>
        </div>
      </div>

      <div 
        className="fr-grid-row fr-mb-4w"
        ref={componentRef}
      >
        <div
          className={`fr-col-4 fr-mr-4w fr-pr-4w ${styles.separator} center`}
        >
          <div>
            <Doughnut
              backgroundColor={niveauDeFormation.formations.map(formation => formation.backgroundColor)}
              data={niveauDeFormation.formations.map(formation => Number(formation.nombre.replace(/\s/g, '')))}
              isFull={false}
              labels={niveauDeFormation.formations.map(formation => formation.nom)}
            />
          </div>
          <div
            className="fr-display--sm fr-mb-0"
            style={{ marginTop: '-3vw', pointerEvents: 'none', position: 'relative', zIndex: -1 }}
          >
            {niveauDeFormation.aidantsEtMediateursFormes}
          </div>
          <div className="fr-text--lg font-weight-700 fr-m-0">
            Aidants et médiateurs
            <br />
            formés ou certifiés
          </div>
          <div className="color-blue-france fr-pb-4w">
            Sur
            {' '}
            <strong>
              {niveauDeFormation.totalAidantsEtMediateurs}
              {' '}
              aidants et médiateurs
            </strong>
          </div>
        </div>
        <div className="fr-col">
          <div className="fr-text--md font-weight-700">
            Dont
          </div>
          <ul>
            {niveauDeFormation.formations.map((formation) => (
              <li
                className="fr-mb-2w fr-mt-1w"
                key={formation.nom}
                style={{ listStyle: 'none' }}
              >
                <div className="fr-text--sm fr-grid-row fr-grid-row--middle">
                  <div style={{ flex: '1 1 auto', minWidth: 0 }}>
                    <Dot color={formation.couleur} />
                    {' '}
                    {formation.nom}
                  </div>
                  <div 
                    className="font-weight-700"
                    style={{ marginLeft: '1rem', marginRight: '1rem', minWidth: '3rem', textAlign: 'right' }}
                  >
                    {formation.nombre}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="fr-grid-row background-info fr-p-3w">
        <InformationLogo />
        Un aidant ou médiateur peut cumuler plusieurs formations
      </p>

      <hr className="fr-hr fr-mt-3w" />
      <div className="fr-grid-row fr-grid-row--middle fr-mt-2w">
        <div style={{ flex: 1 }}>
          <p className="fr-text--sm fr-mb-0">
            Données mises à jour le
            {' '}
            {dateGeneration.toLocaleDateString('fr-FR')}
          </p>
        </div>
        <div>
          <button
            className={`fr-btn fr-btn--tertiary fr-btn--icon-only fr-icon-download-line fr-icon--xs ${gouvernancesStyles['download-button']}`}
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
  viewModel: ErrorViewModel | NiveauDeFormationViewModel
): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  dateGeneration: Date
  niveauDeFormation: ErrorViewModel | NiveauDeFormationViewModel
}>