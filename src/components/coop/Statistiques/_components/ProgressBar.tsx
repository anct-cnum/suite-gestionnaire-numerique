'use client'

import { type CSSProperties, Fragment } from 'react'

function classNames(...classes: Array<boolean | string | undefined>): string {
  return classes.filter(Boolean).join(' ')
}

function ProgressBar({
  className,
  colors = [],
  displayProgress = false,
  max = 100,
  min = 0,
  progress = [],
  size = 'medium',
  style,
  tooltopKey,
}: {
  readonly className?: string
  readonly colors?: Array<string>
  readonly displayProgress?: boolean
  readonly max?: number
  readonly min?: number
  readonly progress?: Array<{ count?: number; label: string; percentage: number }>
  readonly size?: 'large' | 'medium' | 'small'
  readonly style?: CSSProperties
  readonly tooltopKey?: string
}) {
  const heightStyle = style?.height ? { height: style.height } : {}

  return (
    <span
      className={classNames(
        className,
        progress.length > 1 && 'fr-progress-stacked',
        size === 'small' && 'fr-progress--sm',
        size === 'large' && 'fr-progress--lg'
      )}
      style={style}
    >
      {progress.map(({ count, label, percentage }, index) => (
        <Fragment key={label}>
          {tooltopKey ? <span
            aria-hidden
            className="fr-tooltip fr-placement fr-text--md"
            id={`tooltip-progress-bar-${tooltopKey}-${index}`}
            role="tooltip"
          >
            {label}
            {' '}
            :
            {' '}
            <span className="fr-text--bold">
              {count ?? percentage}
            </span>
                        </span> : null}
          <span
            aria-describedby={
              tooltopKey
                ? `tooltip-progress-bar-${tooltopKey}-${index}`
                : undefined
            }
            aria-label={label}
            aria-valuemax={max}
            aria-valuemin={min}
            aria-valuenow={percentage ?? 0}
            className={classNames(
              'fr-progress',
              size === 'small' && 'fr-progress--sm',
              size === 'large' && 'fr-progress--lg'
            )}
            key={label}
            role="progressbar"
            style={{
              ...progress.length > 1 ? { width: `${percentage ?? 0}%` } : {},
              ...heightStyle,
            }}
          >
            <span
              className={`fr-progress__bar ${colors[index % colors.length]}`}
              style={{
                backgroundColor:
                  colors.length > 0
                    ? colors[index % colors.length]
                    : 'var(--background-active-blue-france)',
                width: progress.length === 1 ? `${percentage ?? 0}%` : undefined,
                ...heightStyle,
              }}
            >
              {displayProgress ? `${percentage ?? 0}%` : null}
            </span>
          </span>
        </Fragment>
      ))}
    </span>
  )
}

export default ProgressBar
