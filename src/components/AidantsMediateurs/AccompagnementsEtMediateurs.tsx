'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import html2canvas from 'html2canvas'
import { ReactElement, useRef } from 'react'

import gouvernancesStyles from '../Gouvernances/Gouvernances.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import Metric from '../shared/Metric/Metric'
import TitleIcon from '../shared/TitleIcon/TitleIcon'
import styles from '../TableauDeBord/TableauDeBord.module.css'
import { ErrorViewModel } from '@/components/shared/ErrorViewModel'
import { AccompagnementsEtMediateursEnrichiViewModel } from '@/presenters/tableauDeBord/accompagnementsEtMediateursEnrichiPresenter'

export default function AccompagnementsEtMediateurs({
  accompagnementsEtMediateurs,
  dateGeneration,
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
            link.download = 'accompagnements-et-mediateurs.png'
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

  if (isErrorViewModel(accompagnementsEtMediateurs)) {
    return (
      <section
        aria-labelledby="accompagnements-et-mediateurs"
        className="fr-mb-4w grey-border border-radius fr-p-4w"
      >
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <TitleIcon
              background="white"
              icon="error-warning-line"
            />
            <div className="fr-text--sm color-blue-france fr-mt-2w">
              {accompagnementsEtMediateurs.message}
            </div>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section
      aria-labelledby="accompagnements-et-mediateurs"
      className="fr-mb-4w grey-border border-radius fr-p-4w"
    >
      <div className="fr-grid-row fr-grid-row--middle separator fr-pb-3w fr-mb-3w">
        <div>
          <h2
            className="fr-h4 color-blue-france fr-m-0"
            id="accompagnements-et-mediateurs"
          >
            Accompagnements et Médiateurs numériques
          </h2>
        </div>
      </div>

      <div 
        className="fr-grid-row fr-mb-4w fr-grid-row--gutters"
        ref={componentRef}
      >
        <div className={`fr-col-12 fr-col-md-6 fr-pr-4w ${styles.separator}`}>
          <div
            className="center"
          >
            <div>
              <Doughnut
                backgroundColor={accompagnementsEtMediateurs.thematiques.map(thematique => thematique.backgroundColor)}
                data={accompagnementsEtMediateurs.thematiques.map(thematique => thematique.pourcentage)}
                isFull={false}
                labels={accompagnementsEtMediateurs.thematiques.map(thematique => thematique.nom)}
              />
            </div>
            <div
              className="fr-display--xs fr-mb-0"
              style={{ marginTop: '-3vw', pointerEvents: 'none', position: 'relative', zIndex: -1 }}
            >
              {accompagnementsEtMediateurs.beneficiairesAccompagnes}
            </div>
            <div className="fr-text--lg font-weight-700 fr-m-0">
              Bénéficiaires accompagnés
            </div>
            <div className="color-blue-france fr-pb-4w">
              Soit
              {' '}
              <strong>
                {accompagnementsEtMediateurs.accompagnementsRealises}
                {' '}
                accompagnements réalisés
              </strong>
            </div>
          </div>
          <div className="fr-mt-4w">
            <ul>
              {accompagnementsEtMediateurs.thematiques.map((thematique) => (
                <li
                  className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                  key={thematique.nom}
                >
                  <div
                    className={gouvernancesStyles['text-ellipsis']}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <span className={gouvernancesStyles['dot-margin']}>
                      <Dot color={thematique.couleur} />
                    </span>
                    <span className={gouvernancesStyles['item-type-padding']}>
                      {thematique.nom}
                      {thematique.nombreThematiquesRestantes !== undefined 
                      && thematique.nombreThematiquesRestantes > 0 && (
                        <span>
                          {' '}
                          (
                          {thematique.nombreThematiquesRestantes}
                          )
                        </span>
                      )}
                    </span>
                  </div>
                  <div
                    className="font-weight-700"
                    style={{ flexShrink: 0 }}
                  >
                    {thematique.pourcentage}
                    %
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <hr className="fr-hr fr-mt-3w" />
          <div className="fr-grid-row fr-grid-row--middle fr-mt-2w">
            <div style={{ flex: 1 }}>
              <p className="fr-text--sm fr-mb-0">
                Données mises à jour le
                {' '}
                {dateGeneration.toLocaleDateString('fr-FR')}
              </p>
              {Boolean(accompagnementsEtMediateurs.avertissementApiCoop) && 
                <p className="fr-text--xs color-orange fr-mb-0 fr-mt-1v">
                  ⚠️ 
                  {' '}
                  {accompagnementsEtMediateurs.avertissementApiCoop}
                </p>}
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
        </div>
        <div className="fr-col-12 fr-col-md-6 fr-pl-4w">
          {accompagnementsEtMediateurs.metriques.map((metrique, index) => (
            <div key={metrique.titre}>
              <Metric
                chiffre={metrique.chiffre}
                sousTitre={metrique.sousTitre}
                titre={metrique.titre}
              />
              {index < accompagnementsEtMediateurs.metriques.length - 1 && (
                <hr className="fr-hr fr-my-2w" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function isErrorViewModel(
  viewModel: AccompagnementsEtMediateursEnrichiViewModel | ErrorViewModel
): viewModel is ErrorViewModel {
  return 'type' in viewModel
}

type Props = Readonly<{
  accompagnementsEtMediateurs: AccompagnementsEtMediateursEnrichiViewModel | ErrorViewModel
  dateGeneration: Date
}>