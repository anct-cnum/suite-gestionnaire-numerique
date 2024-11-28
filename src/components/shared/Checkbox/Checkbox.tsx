import React, { ReactElement } from 'react'

export default function Checkbox({
  defaultChecked,
  label,
  id,
  name,
  value,
}: CheckboxProps): ReactElement {
  return (
    <div className="fr-fieldset__element">
      <div className="fr-checkbox-group">
        <input
          aria-describedby={`${id}-messages`}
          defaultChecked={defaultChecked}
          id={id}
          name={name}
          type="checkbox"
          value={value}
        />
        <label
          className="fr-label"
          htmlFor={id}
        >
          {label}
        </label>
        <div
          aria-live="assertive"
          className="fr-messages-group"
          id={`${id}-messages`}
        />
      </div>
    </div>
  )
}

type CheckboxProps = Readonly<{
  defaultChecked: boolean
  id: string
  label: string
  name: string
  value: string
}>
