import React, { PropsWithChildren, ReactElement, ReactNode } from 'react'

export default function TextInput({
  ariaDescribedById,
  children,
  defaultValue = '',
  disabled = false,
  erreur = errorDefault,
  id,
  name,
  pattern,
  required,
  type = 'text',
}: Props): ReactElement {
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
        disabled={disabled}
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
type Props = PropsWithChildren<Readonly<{
  ariaDescribedById?: string
  defaultValue?: string
  disabled?: boolean
  erreur?: Readonly<{
    className: string
    content: ReactNode
  }>
  id: string
  name: string
  pattern?: string
  required: boolean
  type?: 'email' | 'tel' | 'text'
}>>
