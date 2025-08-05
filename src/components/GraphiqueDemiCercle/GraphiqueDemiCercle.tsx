'use client'
import { ReactElement, useRef } from 'react'

import styles from './GraphiqueDemiCercle.module.css'
import Dot from '@/components/shared/Dot/Dot'
import Doughnut from '@/components/shared/Doughnut/Doughnut'

export default function GraphiqueDemiCercle(props: Readonly<Props>): ReactElement {
  const { dateGeneration, description = '',  details, graphiqueInfos,indicateur, label, onDownloadClick } = props
  const componentRef = useRef<HTMLDivElement>(null)
  return (
    <section
      className="fr-mb-3w"
    >
      <div
        className="fr-p-4w fr-border-default--grey"
        style={{ borderRadius: '1rem' }}
      >
        <div
          className="center"
          ref={componentRef}
        >
          <div >
            <Doughnut
              backgroundColor={graphiqueInfos.map(item => item.backgroundColor)}
              data={graphiqueInfos.map(item => item.value)}
              isFull={false}
              labels={graphiqueInfos.map(item => item.label)}
            />
          </div>
          <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`} >
            {indicateur}
          </div>
          <div className="fr-text--lg font-weight-700 fr-m-0" >
            {label}
          </div>
          { description === '' ? null :
            (
              <div className="color-blue-france fr-pb-1w separator" >
                {description}
              </div>
            )}

          <div className="fr-mt-4w">
            <ul>
              {details.map((item) => (
                <li
                  className="fr-grid-row fr-btns-group--space-between fr-mb-1w"
                  key={item.label}
                >
                  <div
                    className={styles['text-ellipsis']}
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <span className={styles['dot-margin']}>
                      <Dot color={item.backgroundColor} />
                    </span>
                    <span className={styles['item-type-padding']}>
                      {item.label}
                    </span>
                  </div>
                  <div
                    className="font-weight-700"
                    style={{ flexShrink: 0 }}
                  >
                    {item.value}
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
              onClick={onDownloadClick}
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
    </section>
  )
}

type Props = {
  dateGeneration: Date
  description?: string
  details: Array<Info>
  graphiqueInfos: Array<Info>
  indicateur: number
  label: string
  onDownloadClick(): void
}

type Info = {
  backgroundColor: string
  label: string
  value: number
}
