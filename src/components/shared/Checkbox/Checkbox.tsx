import React, { ReactElement, ReactNode } from 'react'

export default function Checkbox({
  defaultChecked,
  label,
  id,
  name,
  value,
}: Props): ReactElement {
  return (
    <div className="fr-fieldset__element">
      <div className="fr-checkbox-group">
        <input
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
      </div>
    </div>
  )
}

type Props = Readonly<{
  defaultChecked: boolean
  id: string
  label: ReactNode
  name: string
  value: string
}>
