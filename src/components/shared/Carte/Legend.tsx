'use client'

import { ReactElement } from 'react'

import styles from './Legend.module.css'
import { CONFIANCE_COLORS, FRAGILITE_COLORS } from '@/presenters/tableauDeBord/indicesPresenter'

export default function Legend({ type = 'fragilite' }: LegendProps): ReactElement {
  if (type === 'confiance') {
    const objectifs = [
      {  color: CONFIANCE_COLORS[1],count: 30, label: 'Objectifs sécurisés' },
      {  color: CONFIANCE_COLORS[2],count: 56, label: 'Objectifs atteignables' },
      {  color: CONFIANCE_COLORS[3],count: 2, label: 'Appuis nécessaires' },
      {  color: CONFIANCE_COLORS[4],count: 3, label: 'Objectifs compromis' },
      {   color: CONFIANCE_COLORS[5],count: 2,label: 'Objectifs non enregistrés' },
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

type LegendProps = Readonly<{
  type?: 'confiance' | 'fragilite'
}>
