'use client'

import { numberToPercentage, numberToString } from '../utils'
import classNames from 'classnames'
import type { CSSProperties } from 'react'
import type { QuantifiedShare } from '../types'
import ProgressBar from './ProgressBar'
import styles from './ProgressItemList.module.css'

export const ProgressItemList = ({
  items,
  maxProportion,
  colors,
  color,
  truncateLabel = false,
  oneLineLabel = false,
  tooltipKey,
  classes,
  style,
}: {
  items: QuantifiedShare[]
  maxProportion: number
  truncateLabel?: boolean
  color?: string
  colors?: string[]
  oneLineLabel?: boolean
  tooltipKey?: string
  classes?: {
    label?: string
    count?: string
    proportion?: string
    progressBar?: string
  }
  style?: {
    label?: CSSProperties
    count?: CSSProperties
    proportion?: CSSProperties
    progressBar?: CSSProperties
  }
}) => (
  <div className={classNames('fr-width-full', styles.container)}>
    {items.map(({ label, count, proportion }, index) => {
      const computedColors = color ? [color] : colors && colors.length > 0 ? [colors[index % colors.length]] : []

      const showTooltip = (truncateLabel || oneLineLabel) && tooltipKey

      return (
        <div key={index} className={styles.row}>
          {showTooltip && (
            <span
              className="fr-tooltip fr-placement fr-text--sm fr-p-2v fr-border-radius--8"
              id={`tooltip-${tooltipKey}-${index}`}
              style={{ background: 'rgba(30, 27, 57, 0.95)', color: 'white' }}
              role="tooltip"
              aria-hidden
            >
              {label}
            </span>
          )}
          <span
            className={classNames(
              'fr-text--sm',
              styles.label,
              truncateLabel && styles.truncatedLabel,
              oneLineLabel && styles.oneLineLabel,
              classes?.label
            )}
            style={style?.label}
            aria-describedby={showTooltip ? `tooltip-${tooltipKey}-${index}` : undefined}
          >
            {label}
          </span>
          <span
            className={classNames(
              'fr-text--sm fr-text--right fr-text--bold fr-whitespace-nowrap',
              styles.count,
              classes?.count
            )}
            style={style?.count}
          >
            {numberToString(count)}
          </span>
          <span
            className={classNames(
              'fr-text--sm fr-text--right fr-text--medium fr-text-mention--grey fr-whitespace-nowrap',
              styles.proportion,
              classes?.proportion
            )}
            style={style?.proportion}
          >
            {numberToPercentage(proportion)}
          </span>
          <ProgressBar
            className={classNames(styles.progressBar, classes?.progressBar)}
            style={style?.progressBar}
            progress={[
              {
                label,
                percentage: maxProportion === 0 ? 0 : (100 * proportion) / maxProportion,
              },
            ]}
            colors={computedColors}
          />
        </div>
      )
    })}
  </div>
)
