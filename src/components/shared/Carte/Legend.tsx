'use client'

import { ReactElement } from 'react'

import styles from './Legend.module.css'
import { FRAGILITE_COLORS } from '@/presenters/tableauDeBord/indiceFragilitePresenter'

export default function Legend(): ReactElement {
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
