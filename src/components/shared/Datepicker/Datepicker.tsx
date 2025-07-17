import React, { PropsWithChildren, ReactElement, useId } from 'react'

export default function Datepicker({
  children,
  defaultValue = '',
  disable,
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
        disabled={disable}
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
  disable?: boolean
  min?: string
  name: string
}>>
