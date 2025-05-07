'use client'

import { ChangeEvent, ReactElement, useEffect, useState } from 'react'

import { Montant } from './Montant'
import { useDebouncedEffect } from './useDebouncedEffect'
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

  useDebouncedEffect<Optional<Montant>>(() => {
    onChange(inputValue)
  }, [inputValue], 100)

  function onChangeEvent() {
    return (event: ChangeEvent<HTMLInputElement>) => {
      setInputValue(Montant.of(event.target.value))
    }
  }

  return (
    <input
      className="fr-input"
      id={id}
      name={id}
      onChange={onChangeEvent()}
      required={true}
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
