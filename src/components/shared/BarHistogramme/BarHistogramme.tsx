'use client'

import { ReactElement, useState } from 'react'

const HAUTEUR_MAX_BARRE_REM = 5
const HAUTEUR_MIN_BARRE_REM = 0.25

export default function BarHistogramme({ backgroundColor, data, labels }: Props): ReactElement {
  const [indexSurvole, setIndexSurvole] = useState<null | number>(null)
  const max = Math.max(...data, 1)

  return (
    <div style={{ alignItems: 'flex-end', display: 'flex', gap: '1rem', height: '100%' }}>
      {data.map((valeur, index) => {
        const hauteurRem = valeur > 0 ? Math.max(HAUTEUR_MIN_BARRE_REM, (valeur / max) * HAUTEUR_MAX_BARRE_REM) : 0

        return (
          <div
            key={labels[index]}
            style={{
              display: 'flex',
              flex: '1 0 0',
              flexDirection: 'column',
              gap: '0.5rem',
              justifyContent: 'flex-end',
              minWidth: '1px',
            }}
          >
            <div
              onMouseEnter={() => {
                setIndexSurvole(index)
              }}
              onMouseLeave={() => {
                setIndexSurvole(null)
              }}
              style={{
                backgroundColor: backgroundColor[index],
                borderRadius: '4px',
                cursor: 'pointer',
                flexShrink: 0,
                height: `${hauteurRem}rem`,
                opacity: indexSurvole !== null && indexSurvole !== index ? 0.4 : 1,
                position: 'relative',
                transition: 'opacity 0.15s',
                width: '100%',
              }}
            >
              {indexSurvole === index ? (
                <div
                  style={{
                    backgroundColor: '#161616',
                    borderRadius: '4px',
                    bottom: 'calc(100% + 6px)',
                    color: 'white',
                    fontSize: '14px',
                    left: '50%',
                    padding: '4px 8px',
                    position: 'absolute',
                    transform: 'translateX(-50%)',
                    whiteSpace: 'nowrap',
                    zIndex: 10,
                  }}
                >
                  {valeur}
                </div>
              ) : null}
            </div>
            <p
              className="fr-mb-0"
              style={{
                color: backgroundColor[index] === '#000091' ? '#000091' : '#666666',
                flexShrink: 0,
                fontSize: '10px',
                lineHeight: '16px',
                textAlign: 'center',
                width: '100%',
              }}
            >
              {labels[index]}
            </p>
          </div>
        )
      })}
    </div>
  )
}

type Props = Readonly<{
  backgroundColor: ReadonlyArray<string>
  data: ReadonlyArray<number>
  labels: ReadonlyArray<string>
}>
