'use client'

import {
  ReactElement,
  useEffect,
  useRef,
  useState,
} from 'react'
import { createPortal } from 'react-dom'

import MenuItem, { MenuItemProps } from '@/components/shared/Menu/MenuItem'

export default function Menu({ items }: Readonly<MenuProps>): ReactElement {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ left: number; top: number }>({ left: 0, top: 0 })

  const buttonRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open || !buttonRef.current) {return undefined}

    function updatePosition(): void {
      if (!buttonRef.current) {return}
      const rect = buttonRef.current.getBoundingClientRect()
      setPosition({
        left: rect.right - 300 + window.scrollX,
        top: rect.bottom + window.scrollY,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)

    return ():void => {
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
    return (): void => { document.removeEventListener('click', handleClickOutside) }
  }, [])

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
    <div className="fr-dropdown fr-border-default--grey">
      <button
        aria-controls="dropdown-menu"
        aria-expanded={open}
        aria-haspopup="true"
        className="fr-btn fr-btn--tertiary-no-outline w-100"
        onClick={() => { setOpen((prev) => !prev) }}
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

      {open ? createPortal(
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
          <ul
            id="dropdown-menu"
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
        </div>,
        document.body
      ) : null}
    </div>
  )
}

type MenuProps = {
  items: Array<ReactElement<MenuItemProps, typeof MenuItem>>
}
