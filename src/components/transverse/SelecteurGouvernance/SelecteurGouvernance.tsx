'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import type { OptionGouvernance } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'

export default function SelecteurGouvernance({ options, selectedValue }: Props): ReactElement {
  const router = useRouter()

  return (
    <div className="fr-select-group">
      <label className="fr-label" htmlFor="gouvernance">
        Sélectionnez une gouvernance
      </label>
      <select
        className="fr-select"
        id="gouvernance"
        name="gouvernance"
        onChange={(event) => {
          router.push(`/tableau-de-bord/departement/${event.target.value}`)
        }}
        value={selectedValue ?? ''}
      >
        <option disabled value="">
          Sélectionnez une gouvernance
        </option>
        {options.map((option) => (
          <option key={option.value} label={option.label} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

type Props = Readonly<{
  options: ReadonlyArray<OptionGouvernance>
  selectedValue?: string
}>
