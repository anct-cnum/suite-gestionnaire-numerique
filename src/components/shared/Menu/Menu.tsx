'use client'

import { ReactElement, useEffect, useRef, useState } from 'react'

import MenuItem, { MenuItemProps } from '@/components/shared/Menu/MenuItem'

export default function Menu({ items }: Readonly<MenuProps>): ReactElement {
  const [open, setOpen] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      setTimeout(() => {
        if (
          menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current?.contains(event.target as Node) === false
        ) {
          setOpen(false)
        }
      }, 0)
    }
    document.addEventListener('click', handleClickOutside)
    return (): void => { document.removeEventListener('click', handleClickOutside) }
  }, [])

  const itemsWithCloseMenu = items
    .map((item) => {
      return {
        ...item,
        props: {
          ...item.props,
          onClick: (): void => {
            try {
              item.props.onClick()
            } finally {
              closeMenu()
            }
          },
        },
      }
    })

  function closeMenu(): void {
    setOpen(false)
  }
  return (
    <div
      className="fr-dropdown fr-border-default--grey"
      style={{ display: 'inline-block', position: 'relative' }}
    >
      <button
        aria-controls="dropdown-menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="fr-btn fr-btn--tertiary-no-outline w-100"
        onClick={() => {
          setOpen(true)
        }}
        ref={buttonRef}
        style={{
          textAlign: 'center',
        }}
        type="button"
      >
        <span
          aria-hidden="true"
          style={{ fontSize: '20px' }}
        >
          ⋯
        </span>
      </button>

      {open ?
        <div
          aria-label="Menu des actions"
          className="fr-border-default--grey fr-py-1w"
          style={{
            background: 'white',
            borderRadius:4,
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            position: 'absolute',
            right: 0,
            top: 40,
            zIndex:999,
          }}
        >
          <ul
            id="dropdown-menu"
            ref={menuRef}
            role="menu"
          >
            {itemsWithCloseMenu.flatMap((item, index) => {
              const isLast = index === itemsWithCloseMenu.length - 1
              const itemKey = typeof item.key === 'string' ? item.key : `item-${index}`

              return isLast
                ? [item]
                : [
                  item,
                  <hr
                    className="fr-hr"
                    key={`separator-after-${itemKey}`}
                    style={{
                      backgroundColor: 'var(--border-default-grey)',
                      border: 'none',
                      height: '1px',
                      margin: '0 auto',
                      width:'90%',
                    }}
                  />,
                ]
            })}
          </ul>
        </div> : null}
    </div>

  )
}

type MenuProps = {
  items: Array<ReactElement<MenuItemProps, typeof MenuItem>>
}
