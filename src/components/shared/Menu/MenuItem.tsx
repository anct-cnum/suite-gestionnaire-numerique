'use client'

import { Key, ReactElement } from 'react'

export default function MenuItem({ iconClass, label, onClick }: Readonly<MenuItemProps>): ReactElement {
  return (
    <li
      className="fr-p-0"
      role="none"
    >
      <button
        className="fr-btn fr-btn--tertiary-no-outline fr-btn--icon-left w-full text-left flex items-center justify-start px-4 py-2"
        onClick={(event) => {
          event.stopPropagation()
          onClick()
        }}
        role="menuitem"
        style={{
          minHeight: '48px',
          width: '100%',
        }}
        type="button"
      >
        <span
          aria-hidden="true"
          className={`${iconClass} fr-mr-2w`}
        />
        <span className="fr-text-label--grey">
          {label}
        </span>
      </button>
    </li>
  )
}

export type MenuItemProps = {
  iconClass: string
  key: Key
  readonly label: string
  onClick(): void
}

MenuItem.displayName = 'MenuItem'
