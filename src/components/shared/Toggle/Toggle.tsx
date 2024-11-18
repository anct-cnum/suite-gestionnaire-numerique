import React, { PropsWithChildren, ReactElement } from 'react'

import styles from './Toggle.module.css'

export default function Toggle({
  defaultChecked = false,
  children,
  // Stryker disable next-line BooleanLiteral
  hasSeparator = false,
  id,
  name,
}: ToggleProps): ReactElement {
  const className = hasSeparator ? `fr-pb-2w ${styles['fr-toggle--bb']}` : 'fr-mt-2w'

  return (
    <div className={`fr-toggle ${className}`}>
      <input
        aria-describedby={`${id}-messages`}
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
      <div
        aria-live="polite"
        className="fr-messages-group"
        id={`${id}-messages`}
      />
    </div>
  )
}

type ToggleProps = PropsWithChildren<Readonly<{
  defaultChecked?: boolean
  hasSeparator?: boolean
  id: string
  name: string
}>>
