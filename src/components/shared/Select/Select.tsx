'use client'

import { PropsWithChildren, ReactElement, Ref, useMemo } from 'react'
import ReactSelect, { SelectInstance } from 'react-select'

import { creerInputAvecAriaControls, DropdownIndicator, dsfrSelectStyles } from './styles'
import { LabelValue } from '@/presenters/shared/labels'

export default function Select<Option extends LabelValue<number | string>>({
  ariaControlsId,
  children,
  disabled = false,
  formatOptionLabel,
  id,
  isClearable = false,
  menuPlacement = 'auto',
  name,
  onChange,
  options,
  placeholder = 'Choisir',
  ref,
  required = false,
  value,
}: Props<Option>): ReactElement {
  const defaultOption = options.find((option) => Boolean(option.isSelected)) ?? null
  const selectedOption = value === undefined ? undefined : (options.find((option) => option.value === value) ?? null)
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
      <ReactSelect<Option>
        components={componentsConfig}
        defaultValue={value === undefined ? defaultOption : undefined}
        formatOptionLabel={formatOptionLabel}
        inputId={id}
        instanceId={id}
        isClearable={isClearable}
        isDisabled={disabled}
        menuPlacement={menuPlacement}
        name={name}
        noOptionsMessage={() => 'Pas de résultat'}
        onChange={(option) => onChange?.(option)}
        options={options}
        placeholder={placeholder}
        ref={ref}
        required={required}
        styles={dsfrSelectStyles<Option>()}
        value={selectedOption}
      />
    </div>
  )
}

type Props<Option extends LabelValue<number | string>> = PropsWithChildren<
  Readonly<{
    ariaControlsId?: string
    disabled?: boolean
    formatOptionLabel?(option: Option): ReactElement
    id: string
    isClearable?: boolean
    menuPlacement?: 'auto' | 'bottom' | 'top'
    name?: string
    onChange?(option: null | Option): void
    options: ReadonlyArray<Option>
    placeholder?: string
    ref?: Ref<SelectInstance<Option>>
    required?: boolean
    value?: null | Option['value']
  }>
>
