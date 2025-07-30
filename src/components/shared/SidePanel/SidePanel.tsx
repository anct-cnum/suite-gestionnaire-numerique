'use client'

import React, { ReactPortal, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import './SidePanel.module.css'

export default function SidePanel(props: Props): null | ReactPortal {
  const { children, onClose, open } = props

  const [mounted, setMounted] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent):void {
      if (event.key === 'Escape') {onClose()}
    }

    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }

    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose])

  useEffect(() => {
    function handleClickOutside(mouseEvent: MouseEvent): void {
      const target = mouseEvent.target

      if (!panelRef.current || !(target instanceof Node)) {return}

      if (!panelRef.current.contains(target)) {
        onClose()
      }
    }

    if (open) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return (): void => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [open, onClose])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {return null}

  return createPortal(
    <div
      aria-modal="true"
      className={`fr-modal ${open ? 'fr-modal--opened' : ''} `}
      role="dialog"
    >
      <div
        className="fr-modal__body sidepanel-right fr-col-4"
        ref={panelRef}
      >
        <div className="fr-modal__header">
          <button
            className="fr-link--close fr-link"
            onClick={onClose}
            type="button"
          >
            Fermer
          </button>
        </div>
        <div className="fr-modal__content">
          {children}
        </div>
      </div>
    </div>
    ,
    document.body
  )
}
type Props = {
  readonly children: React.ReactNode
  readonly onClose: () => void
  readonly open: boolean
}
