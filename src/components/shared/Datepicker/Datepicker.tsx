import React, { PropsWithChildren, ReactElement, useId } from 'react'

export default function Datepicker({
  children,
  defaultValue = '',
  min,
  name,
}: Props): ReactElement {
  const id = useId()

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
  min?: string
  name: string
}>>
