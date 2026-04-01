'use client'

import { RefObject, useEffect } from 'react'

export function useDialogAccessibility(
  isOpen: boolean,
  close: () => void,
  dialogRef: RefObject<HTMLDialogElement | null>
): void {
  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    function handleKeyDown(event: KeyboardEvent): void {
      if (event.key === 'Escape') {
        event.preventDefault()
        close()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return (): void => {
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, close])

  useEffect(() => {
    if (!isOpen || !dialogRef.current) {
      return undefined
    }

    const dialog = dialogRef.current
    const previouslyFocusedElement = document.activeElement as HTMLElement | null

    const focusableSelector = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    const focusableElements = dialog.querySelectorAll<HTMLElement>(focusableSelector)
    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }

    function handleTabTrap(event: KeyboardEvent): void {
      if (event.key !== 'Tab') {
        return
      }

      const currentFocusableElements = dialog.querySelectorAll<HTMLElement>(focusableSelector)
      if (currentFocusableElements.length === 0) {
        return
      }

      const firstElement = currentFocusableElements[0]
      const lastElement = currentFocusableElements[currentFocusableElements.length - 1]

      if (event.shiftKey) {
        if (document.activeElement === firstElement) {
          event.preventDefault()
          lastElement.focus()
        }
      } else if (document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    dialog.addEventListener('keydown', handleTabTrap)

    return (): void => {
      dialog.removeEventListener('keydown', handleTabTrap)
      previouslyFocusedElement?.focus()
    }
  }, [isOpen, dialogRef])
}
