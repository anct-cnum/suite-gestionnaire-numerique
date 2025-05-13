import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { Montant } from './Montant'
import MontantInput from './MontantInput'
import { renderComponent } from '@/components/testHelper'
import { Optional } from '@/shared/Optional'

describe('montantInput', () => {
  it('affiche le montant initial correctement', () => {
    renderComponent(
      <MontantInput
        id="montantTest"
        montantInitial={Montant.of('1234')}
        onChange={vi.fn<(montant: Optional<Montant>) => void>()}
      />
    )

    const input = screen.getByRole('textbox', { name: '' })
    expect(input).toHaveValue('1234')
  })

  it('appelle onChange avec une nouvelle valeur après saisie utilisateur', () => {
    const onChange = vi.fn<(montant: Optional<Montant>) => void>()

    renderComponent(
      <MontantInput
        id="montantTest"
        montantInitial={Optional.empty()}
        onChange={onChange}
      />
    )

    const input = screen.getByRole('textbox', { name: '' })
    fireEvent.change(input, { target: { value: '999' } })

    expect(onChange).toHaveBeenCalledWith(Montant.of('999'))
  })
})
