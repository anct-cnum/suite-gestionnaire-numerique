import React, { PropsWithChildren, ReactElement, useId } from 'react'

export default function Datepicker({
  defaultValue = '',
  children,
  name,
  min,
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
  name: string
  min?: string
}>>
