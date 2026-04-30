'use client'

import { ArcElement, Chart as ChartJS, Tooltip } from 'chart.js'
import html2canvas from 'html2canvas'
import { ReactElement, ReactNode, useRef } from 'react'

import styles from './Gouvernances.module.css'
import Dot from '../shared/Dot/Dot'
import Doughnut from '../shared/Doughnut/Doughnut'
import { DownloadButton } from '../shared/Download/DownloadButton'
import TitleIcon from '../shared/TitleIcon/TitleIcon'

export default function MetriqueGouvernanceCard(props: Props): ReactElement {
  ChartJS.register(ArcElement, Tooltip)
  const { ariaId, dateGeneration, downloadFilename, downloadTitle } = props
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
            link.download = downloadFilename
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

  if ('error' in props) {
    return (
      <section aria-labelledby={ariaId} className="fr-mb-4w grey-border border-radius fr-p-4w">
        <div style={{ alignItems: 'center', display: 'flex', justifyContent: 'center', padding: '2rem' }}>
          <div style={{ textAlign: 'center' }}>
            <TitleIcon background="white" icon="error-warning-line" />
            <div className="fr-text--sm color-blue-france fr-mt-2w">{props.error}</div>
          </div>
        </div>
      </section>
    )
  }

  const { items, nombreTotal, subtitle, title } = props
  const listItems = items.filter((item) => !item.hideFromList)

  return (
    <section
      aria-labelledby={ariaId}
      className="fr-mb-4w grey-border border-radius fr-p-4w"
      style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
    >
      {/* Contenu téléchargeable : chart + liste */}
      <div ref={componentRef} style={{ display: 'flex', flexDirection: 'column', gap: '16px', width: '100%' }}>
        <div className="center" style={{ display: 'flex', flexDirection: 'column', gap: '8px', width: '100%' }}>
          <div>
            <Doughnut
              backgroundColor={items.map((item) => item.backgroundColor)}
              data={items.map((item) => item.count)}
              isFull={false}
              labels={items.map((item) => item.label)}
            />
          </div>
          <div className={`fr-display--lg fr-mb-0 ${styles['remonter-donnee']}`}>{nombreTotal}</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'center', width: '100%' }}>
            <div className="fr-text--lg font-weight-700 fr-m-0" style={{ color: '#3a3a3a' }}>
              {title}
            </div>
            <div className="fr-text--xs color-blue-france fr-m-0">{subtitle}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #ddd', width: '100%' }} />

        <ul
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            listStyle: 'none',
            margin: 0,
            padding: 0,
            width: '100%',
          }}
        >
          {listItems.map((item) => (
            <li key={item.label} style={{ alignItems: 'center', display: 'flex', gap: '16px', height: '20px' }}>
              <div
                style={{
                  alignItems: 'center',
                  display: 'flex',
                  flex: '1 0 0',
                  gap: '8px',
                  minWidth: 0,
                  overflow: 'hidden',
                }}
              >
                <Dot color={item.color} />
                <span className={styles['text-ellipsis']} style={{ fontSize: '14px', lineHeight: '20px' }}>
                  {item.label}
                </span>
              </div>
              <span style={{ flexShrink: 0, fontSize: '14px', fontWeight: 700, lineHeight: '20px' }}>{item.count}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Séparateur footer — géré par le gap: 16px de la section */}
      <div style={{ borderTop: '1px solid #ddd', width: '100%' }} />

      <div style={{ alignItems: 'center', display: 'flex', gap: '16px', width: '100%' }}>
        <p className="fr-text--xs fr-mb-0" style={{ flex: 1 }}>
          Données mises à jour le {dateGeneration.toLocaleDateString('fr-FR')}
        </p>
        <DownloadButton
          onClick={() => {
            void handleDownload()
          }}
          title={downloadTitle}
        />
      </div>
    </section>
  )
}

type MetriqueItem = Readonly<{
  backgroundColor: string
  color: string
  count: number
  hideFromList?: boolean
  label: string
}>

type CommonProps = Readonly<{
  ariaId: string
  dateGeneration: Date
  downloadFilename: string
  downloadTitle: string
}>

type DataProps = Readonly<{
  items: ReadonlyArray<MetriqueItem>
  nombreTotal: number
  subtitle: ReactNode
  title: ReactNode
}>

type ErrorProps = Readonly<{ error: string }>

type Props = CommonProps & (DataProps | ErrorProps)
