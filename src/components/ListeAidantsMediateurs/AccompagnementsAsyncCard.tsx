'use client'

import { ReactElement, use } from 'react'

import { ErrorViewModel, isErrorViewModel } from '@/components/shared/ErrorViewModel'
import { formaterEnNombreFrancais } from '@/presenters/shared/number'

export default function AccompagnementsAsyncCard({
  hasActiveFilters,
  totalAccompagnementsPromise,
}: Props): ReactElement {
  const totalAccompagnements = use(totalAccompagnementsPromise)

  if (isErrorViewModel(totalAccompagnements)) {
    return (
      <div
        className="fr-col-12 fr-col-md-4"
        style={{
          height: '7rem',
        }}
      >
        <div
          className="fr-background-alt--blue-france fr-p-2w"
          style={{
            borderRadius: '1rem',
            gap: '1rem',
            height: '7rem',
          }}
        >
          <div className="fr-h5 fr-text-title--blue-france fr-m-0">
            -
          </div>
          <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
            Accompagnements
          </div>
          <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
            sur les 30 derniers jours
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className="fr-col-12 fr-col-md-4"
      style={{
        height: '7rem',
      }}
    >
      <div
        className="fr-background-alt--blue-france fr-p-2w"
        style={{
          borderRadius: '1rem',
          gap: '1rem',
          height: '7rem',
        }}
      >
        <div className="fr-h5 fr-text-title--blue-france fr-m-0">
          {hasActiveFilters ? '-' : formaterEnNombreFrancais(totalAccompagnements)}
        </div>
        <div className="fr-text--sm fr-text-title--blue-france fr-text--bold fr-m-0">
          Accompagnements
        </div>
        <div className="fr-text--sm fr-text-title--blue-france fr-m-0">
          sur les 30 derniers jours
        </div>
      </div>
    </div>
  )
}

type Props = Readonly<{
  hasActiveFilters: boolean
  totalAccompagnementsPromise: Promise<ErrorViewModel | number>
}>
