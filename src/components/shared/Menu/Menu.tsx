'use client'

import { ReactElement, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

import MenuItem, { MenuItemProps } from '@/components/shared/Menu/MenuItem'

export default function Menu({ items, label }: Readonly<MenuProps>): ReactElement {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState({ left: 0, top: 0 })

  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !buttonRef.current) {
      return undefined
    }

    function updatePosition(): void {
      if (!buttonRef.current) {
        return
      }
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        left: rect.right - 300 + window.scrollX,
        top: rect.bottom + window.scrollY,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return (): void => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition)
    }
  }, [open])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent): void {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current?.contains(event.target as Node) === false
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return (): void => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  useEffect(() => {
    if (!open) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        setOpen(false)
        buttonRef.current?.focus()
        return
      }

      if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') {
        return
      }

      event.preventDefault()
      const menuItems = menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
      if (!menuItems || menuItems.length === 0) {
        return
      }

      const currentIndex = Array.from(menuItems).findIndex((item) => item === document.activeElement)

      if (event.key === 'ArrowDown') {
        const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0
        menuItems[nextIndex].focus()
      } else {
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1
        menuItems[prevIndex].focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return (): void => { document.removeEventListener('keydown', handleKeyDown) }
  }, [open])

  function closeMenu(): void {
    setOpen(false)
  }

  const itemsWithCloseMenu = items.map((item) => ({
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
  }))

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <button
        aria-controls="dropdown-menu"
        aria-expanded={open}
        aria-haspopup="true"
        className={
          label === undefined
            ? 'fr-btn fr-btn--sm fr-btn--tertiary fr-icon-more-fill'
            : 'fr-btn fr-btn--sm fr-btn--tertiary fr-btn--icon-right fr-icon-arrow-down-s-line'
        }
        onClick={() => {
          setOpen((prev) => !prev)
        }}
        ref={buttonRef}
        style={{
          textAlign: 'center',
        }}
        type="button"
      >
        {label}
      </button>
      {open
        ? createPortal(
            <div
              aria-label="Menu des actions"
              className="fr-border-default--grey fr-py-1w"
              ref={menuRef}
              style={{
                background: 'white',
                borderRadius: 4,
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                left: position.left,
                position: 'absolute',
                top: position.top,
                width: '300px',
                zIndex: 9999,
              }}
            >
              <ul id="dropdown-menu" role="menu">
                {itemsWithCloseMenu.flatMap((item, index) => {
                  const isLast = index === itemsWithCloseMenu.length - 1
                  const itemKey = typeof item.key === 'string' ? item.key : `item-${index}`

                  return isLast
                    ? [item]
                    : [
                        item,
                        <hr
                          key={`separator-after-${itemKey}`}
                          style={{
                            backgroundColor: 'var(--border-default-grey)',
                            border: 'none',
                            height: '1px',
                            margin: '0 auto',
                            padding: '0',
                            width: '90%',
                          }}
                        />,
                      ]
                })}
              </ul>
            </div>,
            document.body
          )
        : null}
    </div>
  )
}

type MenuProps = {
  items: Array<ReactElement<MenuItemProps, typeof MenuItem>>
  label?: string
}
