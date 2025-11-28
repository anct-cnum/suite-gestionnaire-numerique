'use client'

import { CSSProperties, useMemo, useState } from 'react'

import { QuantifiedShare } from '../types'
import { ProgressItemList } from './ProgressItemList'

const orderQuantifiedShares = (
  quantifiedShares: Array<QuantifiedShare>,
  order?: 'asc' | 'desc'
) => {
  if (!order) {return quantifiedShares}
  return quantifiedShares.sort((a, b) => {
    if (a.count > b.count) {
      return order === 'asc' ? 1 : -1
    }
    if (a.count < b.count) {
      return order === 'asc' ? -1 : 1
    }
    return 0
  })
}

export function QuantifiedShareList({
  classes,
  color,
  colors,
  limit,
  oneLineLabel = false,
  order,
  quantifiedShares,
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
  readonly limit?: {
    count: number
    hideLabel: string
    showLabel: string
  }
  readonly oneLineLabel?: boolean
  readonly order?: 'asc' | 'desc'
  readonly quantifiedShares: Array<QuantifiedShare>
  readonly style?: {
    count?: CSSProperties
    label?: CSSProperties
    progressBar?: CSSProperties
    proportion?: CSSProperties
  }
  readonly truncateLabel?: boolean
}) {
  const listShouldBeTruncacted =
    Boolean(limit?.count) && quantifiedShares.length > (limit?.count ?? 0)

  const [displayFullList, setdisplayFullList] = useState(false)

  const maxProportion = useMemo(
    () =>
      quantifiedShares.reduce(
        (max, quantifiedShare) =>
          quantifiedShare.proportion > max ? quantifiedShare.proportion : max,
        0
      ),
    [quantifiedShares]
  )

  const orderedQuantifiedShares = orderQuantifiedShares(quantifiedShares, order)

  const quantifiedSharesToDisplay =
    !listShouldBeTruncacted || displayFullList
      ? orderedQuantifiedShares
      : orderedQuantifiedShares.slice(0, limit?.count ?? 0)

  return (
    <>
      <ProgressItemList
        classes={classes}
        color={color}
        colors={colors}
        items={quantifiedSharesToDisplay}
        maxProportion={maxProportion}
        oneLineLabel={oneLineLabel}
        style={style}
        truncateLabel={truncateLabel}
      />
      {listShouldBeTruncacted && limit ? <button
        className="fr-btn fr-btn--tertiary-no-outline fr-btn--sm fr-mt-2w"
        onClick={() => { setdisplayFullList(!displayFullList) }}
        type="button"
      >
        {displayFullList ? 
          limit.hideLabel
          : (
            <>
              {limit.showLabel}
              {' '}
              ·
              {quantifiedShares.length - limit.count}
            </>
          )}
        <span
          aria-hidden
          className={
            displayFullList
              ? 'fr-ml-1w ri-arrow-up-s-line'
              : 'fr-ml-1w ri-arrow-down-s-line'
          }
        />
                                </button> : null}
    </>
  )
}
