import React, { PropsWithChildren, ReactElement } from 'react'

export default function TextInput({ defaultValue = '', children, id, name, pattern, required, type = 'text', erreur }: InputProps): ReactElement {
  return (
    // Stryker disable next-line all
    <div className={`fr-input-group ${erreur !== undefined ? 'fr-input-group--error' : ''}`}>
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
        name={name}
        pattern={pattern}
        required={required}
        type={type}
      />
      {
        (erreur !== undefined) ?
          <p
            className="fr-error-text"
            id="text-input-error-desc-error"
          >
            {erreur}
          </p> : null
      }
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
  erreur?: string
}>>
