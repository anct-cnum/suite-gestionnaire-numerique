import React, { FormEvent, PropsWithChildren, ReactElement, ReactNode } from 'react'

export default function TextInput({
  ariaDescribedById,
  children,
  defaultValue = '',
  disabled = false,
  erreur = errorDefault,
  id,
  name,
  onChange,
  pattern,
  placeholder,
  required,
  type = 'text',
  value,
}: Props): ReactElement {
  // Utilise soit un composant contrôlé (value + onChange) soit non-contrôlé (defaultValue)
  const isControlled = value !== undefined && onChange !== undefined
  
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
        defaultValue={isControlled ? undefined : defaultValue}
        disabled={disabled}
        id={id}
        name={name}
        onChange={isControlled ? onChange : undefined}
        pattern={pattern}
        placeholder={placeholder}
        required={required}
        type={type}
        value={isControlled ? value : undefined}
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
  onChange?: (event: FormEvent<HTMLInputElement>) => void
  pattern?: string
  placeholder?: string
  required?: boolean
  type?: 'email' | 'tel' | 'text'
  value?: string
}>>
