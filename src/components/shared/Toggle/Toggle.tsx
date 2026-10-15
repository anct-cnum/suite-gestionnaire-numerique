import { ChangeEvent, PropsWithChildren, ReactElement, useId } from 'react'

import styles from './Toggle.module.css'

export default function Toggle({
  children,
  defaultChecked = false,
  // Stryker disable next-line BooleanLiteral
  disabled = false,
  // Stryker disable next-line BooleanLiteral
  hasSeparator = false,
  // Stryker disable next-line BooleanLiteral
  labelAGauche = false,
  // Stryker disable next-line BooleanLiteral
  libelleEtat = false,
  name,
  onChange,
}: Props): ReactElement {
  const id = useId()
  const className = hasSeparator ? `fr-pb-2w ${styles['fr-toggle--bb']}` : 'fr-mt-2w'
  // Libellés d'état rendus par le DSFR en CSS pur (attr()), aucun JS requis.
  const attributsEtat = libelleEtat ? { 'data-fr-checked-label': 'Activé', 'data-fr-unchecked-label': 'Désactivé' } : {}

  return (
    <div className={`fr-toggle ${labelAGauche ? 'fr-toggle--label-left' : ''} ${className}`}>
      <input
        className="fr-toggle__input"
        defaultChecked={defaultChecked}
        disabled={disabled}
        id={id}
        name={name}
        onChange={onChange}
        type="checkbox"
      />
      <label className="fr-toggle__label" htmlFor={id} {...attributsEtat}>
        {children}
      </label>
    </div>
  )
}

type Props = PropsWithChildren<
  Readonly<{
    defaultChecked?: boolean
    disabled?: boolean
    hasSeparator?: boolean
    labelAGauche?: boolean
    libelleEtat?: boolean
    name: string
    onChange?(event: ChangeEvent<HTMLInputElement>): void
  }>
>
