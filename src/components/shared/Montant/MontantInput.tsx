'use client'

import { ChangeEvent, ReactElement, useEffect, useState } from 'react'

import { Montant } from './Montant'
import { Optional } from '@/shared/Optional'

export default function MontantInput({
  id,
  montantInitial,
  onChange,
}: Readonly<Props>): ReactElement {
  const [inputValue, setInputValue] = useState<Optional<Montant>>(montantInitial)

  useEffect(() => {
    setInputValue(montantInitial)
  }, [montantInitial])

  function onChangeEvent() {
    return (event: ChangeEvent<HTMLInputElement>) => {
      const value = Montant.of(event.target.value)
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
      type="text"
      value={inputValue.orElse(Montant.Zero).format()}
    />
  )
}

type Props = {
  readonly id: string
  readonly montantInitial: Optional<Montant>
  onChange(amount: Optional<Montant>): void
}
