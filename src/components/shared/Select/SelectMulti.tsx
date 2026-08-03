'use client'

import { PropsWithChildren, ReactElement, useMemo } from 'react'
import ReactSelect, { MultiValue } from 'react-select'

import { creerInputAvecAriaControls, DropdownIndicator, dsfrSelectStyles } from './styles'
import { LabelValue } from '@/presenters/shared/labels'

export default function SelectMulti<Option extends LabelValue<number | string>>({
  ariaControlsId,
  children,
  disabled = false,
  id,
  menuPlacement = 'auto',
  name,
  onChange,
  options,
  placeholder = 'Choisir',
  required = false,
}: Props<Option>): ReactElement {
  const defaultOptions = options.filter((option) => Boolean(option.isSelected))
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
      <ReactSelect<Option, true>
        components={componentsConfig}
        defaultValue={defaultOptions}
        inputId={id}
        instanceId={id}
        isDisabled={disabled}
        isMulti
        menuPlacement={menuPlacement}
        name={name}
        noOptionsMessage={() => 'Pas de résultat'}
        onChange={(selection) => onChange?.(selection)}
        options={options}
        placeholder={placeholder}
        required={required}
        styles={dsfrSelectStyles<Option, true>()}
      />
    </div>
  )
}

type Props<Option extends LabelValue<number | string>> = PropsWithChildren<
  Readonly<{
    ariaControlsId?: string
    disabled?: boolean
    id: string
    menuPlacement?: 'auto' | 'bottom' | 'top'
    name?: string
    onChange?(selection: MultiValue<Option>): void
    options: ReadonlyArray<Option>
    placeholder?: string
    required?: boolean
  }>
>
