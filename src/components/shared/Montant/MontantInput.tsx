'use client'

import { ChangeEvent, ReactElement, useEffect, useState } from 'react'

import { MontantPositif } from './MontantPositif'
import { Optional } from '@/shared/Optional'

export default function MontantInput({
  id,
  montantInitial,
  onChange,
}: Readonly<Props>): ReactElement {
  const [inputValue, setInputValue] = useState<Optional<MontantPositif>>(montantInitial)

  useEffect(() => {
    setInputValue(montantInitial)
  }, [montantInitial])

  function onChangeEvent() {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = MontantPositif.of(event.target.value)
      setInputValue(value)
      onChange(value)
    }
  }

  return (
    <input
      className="fr-input"
      id={id}
      name={id}
      onChange={onChangeEvent()}
      required
      style={{
        fontVariantNumeric: 'tabular-nums',
        letterSpacing: '0.1em',
      }}
      type="text"
      value={inputValue.orElse(MontantPositif.Zero).format()}
    />
  )
}

type Props = {
  readonly id: string
  readonly montantInitial: Optional<MontantPositif>
  onChange(amount: Optional<MontantPositif>): void
}
