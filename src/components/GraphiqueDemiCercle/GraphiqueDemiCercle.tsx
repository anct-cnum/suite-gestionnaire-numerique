'use client'
import { ReactElement, useRef } from 'react'

import styles from './GraphiqueDemiCercle.module.css'
import Information from '../shared/Information/Information'
import Dot from '@/components/shared/Dot/Dot'
import Doughnut from '@/components/shared/Doughnut/Doughnut'
import { DownloadButton } from '@/components/shared/Download/DownloadButton'
import { handleDownload } from '@/shared/DownloadHelp'

export default function GraphiqueDemiCercle(props: Readonly<Props>): ReactElement {
  const { dateGeneration, description = '',  details, graphiqueInfos,indicateur, information, label } = props
  const componentRef = useRef<HTMLDivElement>(null)
  return (
    <section className="fr-mb-3w">
      <div
        className="fr-p-4w fr-border-default--grey"
        style={{ borderRadius: '1rem' }}
      >
        <div
          className="center"
          ref={componentRef}
        >
          <div>
            <Doughnut
              backgroundColor={graphiqueInfos.map((item) => item.backgroundColor)}
              data={graphiqueInfos.map((item) => item.value)}
              isFull={false}
              labels={graphiqueInfos.map((item) => item.label)}
            />
          </div>
          <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>
            {indicateur}
          </div>
          <div className="fr-text--lg font-weight-700 fr-m-0">
            {label}
            {information === undefined ? null : (
              <Information>
                <p className="fr-mb-0">
                  {information}
                </p>
              </Information>
            )}
          </div>
          {description === '' ? null : (
            <div className="color-blue-france fr-pb-1w separator">
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
          <div style={{ display: 'none', flex: 1 }}>
            <p className="fr-text--sm fr-mb-0">
              Données mises à jour le 
              {' '}
              {dateGeneration.toLocaleDateString('fr-FR')}
            </p>
          </div>
          <DownloadButton
            onClick={() => {
              void handleDownload(componentRef, label)
            }}
            title={label}
          />
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
  information?: string
  label: string
}

type Info = {
  backgroundColor: string
  label: string
  value: number
}
