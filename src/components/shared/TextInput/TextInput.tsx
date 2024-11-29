import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'

export default function TextInput({ defaultValue = '', children, id, name, pattern, required, type = 'text', erreur }: InputProps): ReactElement {
  return (
    <div className={`fr-input-group ${erreur?.className}`}>
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
      </label>
      <input
        aria-required={required}
        className="fr-input"
        defaultValue={defaultValue}
        id={id}
        min={min}
        name={name}
        pattern={pattern}
        required={required}
        type={type}
      />
      {erreur?.content}
    </div>
  )
}

type InputProps = PropsWithChildren<Readonly<{
  defaultValue?: string
  id: string
  name: string
  pattern?: string
  required: boolean
  type?: 'text' | 'tel' | 'email'
  erreur?: Readonly<{
    className: string
    content: ReactNode
  }>
}>>
