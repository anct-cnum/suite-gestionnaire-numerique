'use client'

import { type ChangeEvent, type KeyboardEvent, type ReactElement, useState } from 'react'

export default function TimeInput(props: TimeInputProps): ReactElement {
  const { defaultValue, disabled, name, placeholder = 'HH:MM' } = props
  const [value, setValue] = useState(defaultValue ?? '')

  function formatTimeValue(input: string): string {
    // Supprimer tous les caractères non numériques
    const numbers = input.replace(/\D/gu, '')

    // Limiter à 4 chiffres
    const truncated = numbers.slice(0, 4)

    // Formater selon la longueur
    if (truncated.length === 0) {
      return ''
    }
    if (truncated.length <= 2) {
      return truncated
    }

    // Ajouter automatiquement les ":"
    return `${truncated.slice(0, 2)}:${truncated.slice(2)}`
  }

  function validateTime(timeString: string): boolean {
    if (timeString === '') {
      return true
    }

    const parts = timeString.split(':')
    if (parts.length !== 2) {
      return false
    }

    const hours = Number.parseInt(parts[0] ?? '', 10)
    const minutes = Number.parseInt(parts[1] ?? '', 10)

    return hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59
  }

  function handleChange(event: ChangeEvent<HTMLInputElement>): void {
    const inputValue = event.target.value
    const formatted = formatTimeValue(inputValue)

    // Valider les heures et minutes
    if (formatted.length === 5) {
      const [hoursStr, minutesStr] = formatted.split(':')
      const hours = Number.parseInt(hoursStr, 10)
      const minutes = Number.parseInt(minutesStr, 10)

      // Corriger les valeurs invalides
      if (hours > 23) {
        setValue(`23:${minutesStr}`)
        return
      }
      if (minutes > 59) {
        setValue(`${hoursStr}:59`)
        return
      }
    }

    setValue(formatted)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>): void {
    // Permettre les touches de navigation
    const allowedKeys = ['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (allowedKeys.includes(event.key)) {
      return
    }

    // Permettre Ctrl+A, Ctrl+C, Ctrl+V, etc.
    if (event.ctrlKey || event.metaKey) {
      return
    }

    // Permettre uniquement les chiffres
    if (!/^\d$/u.test(event.key)) {
      event.preventDefault()
    }
  }

  const isValid = validateTime(value)

  return (
    <input
      className={`fr-input ${!isValid && value !== '' ? 'fr-input--error' : ''}`}
      disabled={disabled}
      name={name}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      type="text"
      value={value}
    />
  )
}

type TimeInputProps = Readonly<{
  defaultValue?: string
  disabled?: boolean
  name: string
  placeholder?: string
}>
