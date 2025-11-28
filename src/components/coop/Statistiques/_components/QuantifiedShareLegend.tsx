import type { QuantifiedShare } from '../types'
import { numberToPercentage, numberToString } from '../utils'
import styles from './QuantifiedShareLegend.module.css'

export function QuantifiedShareLegend({
  className,
  colors,
  oneLineLabel = false,
  quantifiedShares,
  truncateLabel = false,
}: {
  readonly className?: string
  readonly colors: Array<string>
  readonly oneLineLabel?: boolean
  readonly quantifiedShares: Array<QuantifiedShare>
  readonly truncateLabel?: boolean
}) {
  return (<div
    className={classNames('fr-width-full fr-px-0', styles.container, className)}
          >
    {quantifiedShares.map(({ count, label, proportion }, index) => (
      <div
        className={styles.row}
        key={label}
      >
        <span
          aria-hidden
          style={{
            backgroundColor: colors[index % colors.length],
            borderRadius: '50%',
            display: 'inline-block',
            flexShrink: 0,
            height: '10px',
            width: '10px',
          }}
        />
        <span
          className={classNames(
            'fr-text--sm',
            styles.label,
            truncateLabel && styles.truncatedLabel,
            oneLineLabel && styles.oneLineLabel
          )}
          title={truncateLabel ? label : undefined}
        >
          {label}
        </span>
        <span className={classNames('fr-text--sm fr-text--bold', styles.count)}>
          {numberToString(count ?? 0)}
        </span>
        <span
          className={classNames(
            'fr-text--sm fr-text--medium fr-text-mention--grey',
            styles.proportion
          )}
        >
          {numberToPercentage(proportion)}
        </span>
      </div>
    ))}
          </div>)
}

function classNames(...classes: Array<boolean | string | undefined>): string {
  return classes.filter(Boolean).join(' ')
}
