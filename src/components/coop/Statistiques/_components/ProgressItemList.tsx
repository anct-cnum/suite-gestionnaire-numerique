
import type { QuantifiedShare } from '../types'
import { numberToPercentage, numberToString } from '../utils'
import ProgressBar from './ProgressBar'
import styles from './ProgressItemList.module.css'
import type { CSSProperties } from 'react'

export function ProgressItemList({
  classes,
  color,
  colors,
  items,
  maxProportion,
  oneLineLabel = false,
  style,
  truncateLabel = false,
}: {
  readonly classes?: {
    count?: string
    label?: string
    progressBar?: string
    proportion?: string
  }
  readonly color?: string
  readonly colors?: Array<string>
  readonly items: Array<QuantifiedShare>
  readonly maxProportion: number
  readonly oneLineLabel?: boolean
  readonly style?: {
    count?: CSSProperties
    label?: CSSProperties
    progressBar?: CSSProperties
    proportion?: CSSProperties
  }
  readonly truncateLabel?: boolean
}) {
  return (<div className={classNames('fr-width-full', styles.container)}>
    {items.map(({ count, label, proportion }, index) => {
      const computedColors = color
        ? [color]
        : colors && colors.length > 0
          ? [colors[index % colors.length]]
          : []

      return (
        <div
          className={styles.row}
          key={index}
        >
          <div className={styles.leftPart}>
            <span
              className={classNames(
                'fr-text--sm',
                styles.label,
                truncateLabel && styles.truncatedLabel,
                oneLineLabel && styles.oneLineLabel,
                classes?.label
              )}
              style={style?.label}
              title={truncateLabel ? label : undefined}
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
          </div>
          <div className={styles.rightPart}>
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
              colors={computedColors}
              progress={[
                {
                  label,
                  percentage:
                    maxProportion === 0 ? 0 : 100 * proportion / maxProportion,
                },
              ]}
              style={style?.progressBar}
            />
          </div>
        </div>
      )
    })}
          </div>)
}

function classNames(...classes: Array<boolean | string | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
