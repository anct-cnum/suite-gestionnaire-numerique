'use client'

import { ReactElement } from 'react'

import styles from './Legend.module.css'
import { CONFIANCE_COLORS, FRAGILITE_COLORS } from '@/presenters/tableauDeBord/indicesPresenter'

export default function Legend(props: LegendProps): ReactElement {
  if (props.type === 'confiance') {
    return legendeConfiance(props.statistiques)
  }
  
  return legendeFragilite()
}

function legendeConfiance(statistiques: Readonly<{
  appuinecessaire: number
  atteignable: number
  compromis: number
  nonenregistres: number
  securise: number
}>): ReactElement {
  const objectifs = [
    { color: CONFIANCE_COLORS[1], count: statistiques.securise, label: 'Objectifs sécurisés' },
    { color: CONFIANCE_COLORS[2], count: statistiques.atteignable, label: 'Objectifs atteignables' },
    { color: CONFIANCE_COLORS[3], count: statistiques.appuinecessaire, label: 'Appuis nécessaires' },
    { color: CONFIANCE_COLORS[4], count: statistiques.compromis, label: 'Objectifs compromis' },
    { color: CONFIANCE_COLORS[5], count: statistiques.nonenregistres, label: 'Objectifs non enregistrés' },
  ]

  return (
    <div
      className={styles.legendContainer}
      style={{ width: '100%' }}
    >
      <div style={{ 
        columnGap: '2rem',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        rowGap: '0.5rem',
        width: '100%',
      }}
      >
        {objectifs.map((obj) => (
          <div
            key={obj.label}
            style={{ 
              alignItems: 'center',
              display: 'flex',
              gap: '0.5rem',
              width: '100%',
            }}
          >
            <span
              style={{
                backgroundColor: obj.color,
                borderRadius: '50%',
                display: 'inline-block',
                flexShrink: 0,
                height: '0.8rem',
                width: '0.8rem',
              }}
            />
            <span style={{ 
              color: '#161616',
              flex: 1,
              fontFamily: 'Marianne',
              fontSize: '14px',
              fontWeight: 400,
              lineHeight: '20px',
            }}
            >
              {obj.label}
            </span>
            <span style={{ 
              color: '#161616',
              fontFamily: 'Marianne',
              fontSize: '14px',
              fontWeight: 700,
              lineHeight: '20px',
              marginLeft: '0.25rem',
            }}
            >
              {obj.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function legendeFragilite(): ReactElement {
  const colors = Object.values(FRAGILITE_COLORS)

  return (
    <div
      className={styles.legendContainer}
      style={{ width:'100%' }}
    >
      <span style={{ whiteSpace: 'nowrap' }}>
        Risque faible
      </span>
      <div
        className={styles.gradientBar}
        style={{ width:'100%' }}
      >
        {colors.map((color) => (
          <div
            className={styles.colorBlock}
            key={color}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span style={{ whiteSpace: 'nowrap' }}>
        Risque fort
      </span>
    </div>
  )
} 
type LegendProps = Readonly<
  | {
    statistiques: Readonly<{
      appuinecessaire: number
      atteignable: number
      compromis: number
      nonenregistres: number
      securise: number
    }>
    type: 'confiance'
  }
  | {
    type: 'fragilite'
  }
>
