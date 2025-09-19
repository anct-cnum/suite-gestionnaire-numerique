'use client'

import { ReactElement } from 'react'

export default function CheckboxGroup({
  legend,
  name,
  onChange,
  options,
  selectedValues = [],
}: Props): ReactElement {
  function handleChange(value: string, checked: boolean): void {
    const newValues = checked
      ? [...selectedValues, value]
      : selectedValues.filter(v => v !== value)
    onChange(newValues)
  }

  return (
    <fieldset className="fr-fieldset fr-mb-3w">
      <legend className="fr-fieldset__legend fr-text--regular">
        {legend}
      </legend>
      <div className="fr-fieldset__content">
        {options.map((option) => (
          <div
            className="fr-checkbox-group"
            key={option.value}
          >
            <input
              checked={selectedValues.includes(option.value)}
              id={`${name}-${option.value}`}
              name={name}
              onChange={(e) => handleChange(option.value, e.target.checked)}
              type="checkbox"
              value={option.value}
            />
            <label
              className="fr-label"
              htmlFor={`${name}-${option.value}`}
            >
              {option.label}
            </label>
          </div>
        ))}
      </div>
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
  onChange: (values: Array<string>) => void
  options: ReadonlyArray<CheckboxOption>
  selectedValues?: Array<string>
}>