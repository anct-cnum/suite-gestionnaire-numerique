import React, { PropsWithChildren, ReactElement } from 'react'

export default function Input({ defaultValue, children, id, name, pattern, required = true, type = 'text' }: InputProps): ReactElement {
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
        name={name}
        pattern={pattern}
        required={required}
        type={type}
      />
    </div>
  )
}

type InputProps = PropsWithChildren<Readonly<{
  defaultValue: string
  id: string
  name: string
  pattern?: string
  required: boolean
  type?: string
}>>
