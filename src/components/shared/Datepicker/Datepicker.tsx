import React, { PropsWithChildren, ReactElement } from 'react'

export default function Datepicker({
  defaultValue = '',
  children,
  id,
  name,
  min,
}: Props): ReactElement {
  return (
    <div className="fr-input-group">
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
      </label>
      <input
        className="fr-input"
        defaultValue={defaultValue}
        id={id}
        min={min}
        name={name}
        type="date"
      />
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  defaultValue?: string
  id: string
  name: string
  min?: string
}>>
