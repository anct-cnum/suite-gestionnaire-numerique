import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { Montant } from './Montant'
import MontantInput from './MontantInput'
import { Optional } from '@/shared/Optional'

vi.useFakeTimers()

describe('montantInput', () => {
  let onChangeMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // eslint-disable-next-line vitest/require-mock-type-parameters
    onChangeMock = vi.fn()
  })

  afterEach(() => {
    vi.clearAllTimers()
  })

  it('affiche le montant initial', () => {
    render(
      <MontantInput
        id="test-montant"
        montantInitial={Montant.of('123')}
        onChange={onChangeMock}
      />
    )

    const input: HTMLInputElement = screen.getByRole('textbox')
    expect(input.value).toBe('123')
  })

  it('déclenche onChange après 500ms quand l’input change', () => {
    render(
      <MontantInput
        id="test-montant"
        montantInitial={Optional.empty()}
        onChange={onChangeMock}
      />
    )

    const input = screen.getByRole('textbox')

    // Simuler la saisie manuelle
    fireEvent.change(input, { target: { value: '456' } })

    // onChange ne doit pas être appelé immédiatement
    expect(onChangeMock).not.toHaveBeenCalled()

    // Avancer le temps (debounce = 500ms)
    vi.advanceTimersByTime(500)

    expect(onChangeMock).toHaveBeenCalledTimes(1)
    const result = onChangeMock.mock.calls[0][0] as Optional<Montant>
    expect(result.isPresent()).toBe(true)
    expect(result.orElse(Montant.Zero).get).toBe(456)
  })

  it('met à jour la valeur affichée quand la prop montantInitial change', () => {
    const { rerender } = render(
      <MontantInput
        id="test-montant"
        montantInitial={Montant.of('10')}
        onChange={onChangeMock}
      />
    )

    const input: HTMLInputElement = screen.getByRole('textbox')
    expect(input.value).toBe('10')

    rerender(
      <MontantInput
        id="test-montant"
        montantInitial={Montant.of('999')}
        onChange={onChangeMock}
      />
    )

    expect(input.value).toBe('999')
  })
})
