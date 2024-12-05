import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'

export default function TextInput({
  ariaDescribedById,
  defaultValue = '',
  children,
  id,
  name,
  pattern,
  required,
  type = 'text',
  erreur = errorDefault,
}: InputProps): ReactElement {
  return (
    <div className={`fr-input-group ${erreur.className}`}>
      <label
        className="fr-label"
        htmlFor={id}
      >
        {children}
      </label>
      <input
        aria-describedby={ariaDescribedById}
        aria-required={required}
        className="fr-input"
        defaultValue={defaultValue}
        id={id}
        name={name}
        pattern={pattern}
        required={required}
        type={type}
      />
      {erreur.content}
    </div>
  )
}

const errorDefault = { className: '', content: '' }
type InputProps = PropsWithChildren<Readonly<{
  ariaDescribedById?: string
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
