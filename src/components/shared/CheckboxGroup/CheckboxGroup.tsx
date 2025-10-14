'use client'

import { ReactElement } from 'react'

import Checkbox from '../Checkbox/Checkbox'

export default function CheckboxGroup({
  legend,
  name,
  onChange,
  options,
  selectedValues,
}: Props): ReactElement {
  function handleChange(value: string, checked: boolean): void {
    const currentValues = selectedValues ?? []
    const newValues = checked
      ? [...currentValues, value]
      : currentValues.filter(_value => _value !== value)
    onChange(newValues)
  }

  return (
    <fieldset className="fr-fieldset fr-mb-1w">
      <legend className="fr-fieldset__legend fr-text--regular">
        {legend}
      </legend>
      {options.map((option) => (
        <Checkbox
          id={`${name}-${option.value}`}
          isSelected={(selectedValues ?? []).includes(option.value)}
          key={option.value}
          label={name}
          onChange={(element) => { handleChange(option.value, element.target.checked) }}
          value={option.value}
        >
          {option.label}
        </Checkbox>
      ))}
    </fieldset>
  )
}

type CheckboxOption = Readonly<{
  label: string
  value: string
}>

type Props = Readonly<{
  legend: string
  name: string
  onChange(values: Array<string>): void
  options: ReadonlyArray<CheckboxOption>
  selectedValues?: Array<string>
}>
