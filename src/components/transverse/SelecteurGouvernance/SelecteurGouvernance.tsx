'use client'

import { useRouter } from 'next/navigation'
import { ReactElement } from 'react'
import Select, { StylesConfig } from 'react-select'

import { OptionGouvernance } from '@/presenters/tableauDeBord/selecteurGouvernancePresenter'

export default function SelecteurGouvernance({ codeDepartementActuel, options }: Props): ReactElement {
  const router = useRouter()
  const valeurActuelle = options.find((option) => option.value === codeDepartementActuel) ?? null

  return (
    <div className="fr-select-group">
      <Select
        components={{ DropdownIndicator }}
        inputId="gouvernance"
        instanceId="gouvernance"
        isClearable={false}
        name="gouvernance"
        onChange={(option) => {
          if (option) {
            router.push(`/tableau-de-bord/${option.value}`)
          }
        }}
        options={options as Array<OptionGouvernance>}
        placeholder="Sélectionnez une gouvernance"
        styles={styles}
        value={valeurActuelle}
      />
    </div>
  )
}

// istanbul ignore next @preserve
const styles: StylesConfig<OptionGouvernance> = {
  control: (baseStyles) => ({
    ...baseStyles,
    backgroundColor: 'var(--background-contrast-grey)',
    border: 'none',
    borderRadius: '.25rem .25rem 0 0',
    boxShadow: 'inset 0 -2px 0 0 var(--border-plain-grey)',
    color: 'var(--text-default-grey)',
    cursor: 'pointer',
  }),
  option: (baseStyles, { isFocused, isSelected }) => {
    const colorOfFocus = isFocused ? '#dfdfdf' : undefined
    const backgroundColor = isSelected ? '#bbb' : colorOfFocus
    return {
      ...baseStyles,
      backgroundColor,
      color: '#222',
      cursor: 'pointer',
    }
  },
}

function DropdownIndicator(): ReactElement {
  return (
    <svg
      height="24"
      width="24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="m12 13.1 5-4.9 1.4 1.4-6.4 6.3-6.4-6.4L7 8.1l5 5z" />
    </svg>
  )
}

type Props = Readonly<{
  codeDepartementActuel?: string
  options: ReadonlyArray<OptionGouvernance>
}>
