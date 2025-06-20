'use client'

import styles from './Legend.module.css'
import { FRAGILITE_COLORS } from '@/presenters/indiceFragilitePresenter'

export default function Legend() {
  const colors = Object.values(FRAGILITE_COLORS)

  return (
    <div className={styles.legendContainer}>
      <span>
        Risque faible
      </span>
      <div className={styles.gradientBar}>
        {colors.map((color) => (
          <div
            className={styles.colorBlock}
            key={color}
            style={{ backgroundColor: color }}
          />
        ))}
      </div>
      <span>
        Risque fort
      </span>
    </div>
  )
} 