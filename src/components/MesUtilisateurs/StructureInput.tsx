import { ReactElement, useEffect, useState } from 'react'
import Select, { StylesConfig } from 'react-select'

export default function StructureInput({ structureId, label, options }: StructureInputProps): ReactElement {
  const [value, setValue] = useState<unknown>()

  useEffect(() => {
    setValue(null)
  }, [label])

  return (
    <div className="fr-select-group">
      <label
        className="fr-label"
        htmlFor={structureId}
      >
        {label}
        {' '}
        <span className="color-red">
          *
        </span>
      </label>
      <Select
        components={{ DropdownIndicator }}
        inputId={structureId}
        instanceId={structureId}
        isClearable={true}
        name={structureId}
        onChange={setValue}
        options={options}
        placeholder=""
        required={true}
        styles={styles}
        value={value}
      />
    </div>
  )
}

type StructureInputProps = Readonly<{
  structureId: string
  label: string
  options: Array<{id: string, label: string}>
}>

const styles: StylesConfig = {
  control: (styles) => ({
    ...styles,
    backgroundColor: 'var(--background-contrast-grey)',
    border: 'none',
    borderRadius: '.25rem .25rem 0 0',
    boxShadow: 'inset 0 -2px 0 0 var(--border-plain-grey)',
    color: 'var(--text-default-grey)',
    cursor: 'pointer',
  }),
  option: (styles, { isFocused, isSelected }) => {
    const backgroundColor = isSelected ? '#bbb' : isFocused ? '#dfdfdf' : undefined

    return {
      ...styles,
      backgroundColor,
      borderBottom: '1px solid #ddd',
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
