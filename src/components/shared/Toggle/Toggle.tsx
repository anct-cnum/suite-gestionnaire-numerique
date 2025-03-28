import React, { PropsWithChildren, ReactElement, useId } from 'react'

import styles from './Toggle.module.css'

export default function Toggle({
  children,
  defaultChecked = false,
  // Stryker disable next-line BooleanLiteral
  hasSeparator = false,
  name,
}: Props): ReactElement {
  const id = useId()
  const className = hasSeparator ? `fr-pb-2w ${styles['fr-toggle--bb']}` : 'fr-mt-2w'

  return (
    <div className={`fr-toggle ${className}`}>
      <input
        className="fr-toggle__input"
        defaultChecked={defaultChecked}
        id={id}
        name={name}
        type="checkbox"
      />
      <label
        className="fr-toggle__label"
        htmlFor={id}
      >
        {children}
      </label>
    </div>
  )
}

type Props = PropsWithChildren<Readonly<{
  defaultChecked?: boolean
  hasSeparator?: boolean
  name: string
}>>
