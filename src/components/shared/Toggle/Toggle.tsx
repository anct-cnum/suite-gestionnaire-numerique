import React, { PropsWithChildren, ReactElement } from 'react'

import styles from './Toggle.module.css'

export default function Toggle({
  defaultChecked = false,
  children,
  // Stryker disable next-line BooleanLiteral
  hasSeparator = false,
  id,
  name,
}: Props): ReactElement {
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
  id: string
  name: string
}>>
