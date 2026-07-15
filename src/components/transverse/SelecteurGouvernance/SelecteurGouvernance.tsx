'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'

import Select from '@/components/shared/Select/Select'
import type { OptionGouvernance } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'

export default function SelecteurGouvernance({ options, selectedValue }: Props): ReactElement {
  const router = useRouter()

  return (
    <Select
      id="gouvernance"
      name="gouvernance"
      onChange={(option) => {
        if (option !== null) {
          router.push(`/tableau-de-bord/departement/${option.value}`)
        }
      }}
      options={options}
      placeholder="Sélectionnez une gouvernance"
      value={selectedValue ?? ''}
    >
      Sélectionnez une gouvernance
    </Select>
  )
}

type Props = Readonly<{
  options: ReadonlyArray<OptionGouvernance>
  selectedValue?: string
}>
