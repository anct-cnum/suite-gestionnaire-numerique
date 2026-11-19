'use client'

import { numberToPercentage, numberToString } from '../utils'
import classNames from 'classnames'
import type { QuantifiedShare } from '../types'
import styles from './QuantifiedShareLegend.module.css'

export const QuantifiedShareLegend = ({
  colors,
  quantifiedShares,
  className,
  truncateLabel = false,
  oneLineLabel = false,
  tooltipKey,
}: {
  colors: string[]
  quantifiedShares: QuantifiedShare[]
  className?: string
  truncateLabel?: boolean
  oneLineLabel?: boolean
  tooltipKey?: string
}) => (
  // #2251 : vraie liste ; chaque élément se lit d'un tenant : « libellé : nombre soit part »
  <ul
    className={classNames(
      'fr-raw-list fr-position-relative fr-width-full fr-px-0 fr-mb-0',
      styles.container,
      className
    )}
  >
    {quantifiedShares.map(({ label, count, proportion }, index) => {
      const showTooltip = (truncateLabel || oneLineLabel) && tooltipKey

      return (
        <li key={label} className={styles.row}>
          <span className="ri-circle-fill" style={{ color: colors[index % colors.length] }} aria-hidden />
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
              oneLineLabel && styles.oneLineLabel
            )}
            aria-describedby={showTooltip ? `tooltip-${tooltipKey}-${index}` : undefined}
          >
            {label}
            <span className="fr-sr-only">&nbsp;:</span>
          </span>
          <span className={classNames('fr-text--sm fr-text--bold fr-text--nowrap', styles.count)}>
            {numberToString(count ?? 0)}
          </span>
          <span
            className={classNames(
              'fr-text--sm fr-text--medium fr-text-mention--grey fr-text--nowrap',
              styles.proportion
            )}
          >
            <span className="fr-sr-only">soit </span>
            {numberToPercentage(proportion)}
          </span>
        </li>
      )
    })}
  </ul>
)
