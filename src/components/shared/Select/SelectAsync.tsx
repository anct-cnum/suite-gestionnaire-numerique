'use client'

import { PropsWithChildren, ReactElement, useMemo } from 'react'
import AsyncSelect from 'react-select/async'

import { creerInputAvecAriaControls, DropdownIndicator, dsfrSelectStyles } from './styles'

export default function SelectAsync<Option>({
  ariaControlsId,
  children,
  formatOptionLabel,
  id,
  isClearable = false,
  loadingMessage = 'Chargement...',
  loadOptions,
  menuPlacement = 'auto',
  name,
  noOptionsMessage = () => 'Pas de résultat',
  onChange,
  placeholder = 'Choisir',
  required = false,
  value,
}: Props<Option>): ReactElement {
  const componentsConfig = useMemo(
    () =>
      ariaControlsId === undefined
        ? { DropdownIndicator }
        : { DropdownIndicator, Input: creerInputAvecAriaControls(ariaControlsId) },
    [ariaControlsId]
  )

  return (
    <div className="fr-select-group">
      <label className="fr-label fr-mb-1w" htmlFor={id}>
        {children}
      </label>
      <AsyncSelect<Option>
        components={componentsConfig}
        formatOptionLabel={formatOptionLabel}
        inputId={id}
        instanceId={id}
        isClearable={isClearable}
        loadingMessage={() => loadingMessage}
        loadOptions={loadOptions}
        menuPlacement={menuPlacement}
        name={name}
        noOptionsMessage={({ inputValue }) => noOptionsMessage(inputValue)}
        onChange={(option) => onChange?.(option)}
        placeholder={placeholder}
        required={required}
        styles={dsfrSelectStyles<Option>()}
        value={value}
      />
    </div>
  )
}

type Props<Option> = PropsWithChildren<
  Readonly<{
    ariaControlsId?: string
    formatOptionLabel?(option: Option): ReactElement
    id: string
    isClearable?: boolean
    loadingMessage?: string
    loadOptions(recherche: string): Promise<Array<Option>>
    menuPlacement?: 'auto' | 'bottom' | 'top'
    name?: string
    noOptionsMessage?(inputValue: string): string
    onChange?(option: null | Option): void
    placeholder?: string
    required?: boolean
    value?: null | Option
  }>
>
