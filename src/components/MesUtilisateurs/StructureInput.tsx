import { ReactElement, useEffect } from 'react'
import Select, { StylesConfig } from 'react-select'

export default function StructureInput({
  structureId,
  label,
  options,
  organisation,
  setOrganisation,
}: StructureInputProps): ReactElement {
  useEffect(() => {
    setOrganisation(undefined)
  }, [label, setOrganisation])

  useEffect(() => {
    const getStructures = async (): Promise<void> => {
      const structures = await fetch('/api/structures?search=abc')
      console.log('==============', structures)
    }
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    getStructures()
  }, [])

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
        menuPlacement="auto"
        name={structureId}
        noOptionsMessage={() => 'Pas de résultat'}
        onChange={setOrganisation as (organisation: unknown) => void}
        options={options}
        placeholder=""
        required={true}
        styles={styles}
        value={organisation}
      />
    </div>
  )
}

type StructureInputProps = Readonly<{
  structureId: string
  label: string
  options: Array<{id: string, label: string}>
  organisation: OrganisationOption | undefined
  setOrganisation: (organisation: OrganisationOption | undefined) => void
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
  option: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: isFocused ? '#dfdfdf' : undefined,
    borderBottom: '1px solid #ddd',
    color: '#222',
    cursor: 'pointer',
  }),
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

export type OrganisationOption = Readonly<{
  id: string
  label: string
}>
