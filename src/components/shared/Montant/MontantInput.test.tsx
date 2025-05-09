import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('appelle onChange avec le montant initial à l’affichage', () => {
    const onChange = vi.fn<(montant: Optional<Montant>) => void>()
    renderComponent(
      <MontantInput
        id="montantTest"
        montantInitial={Montant.of('1234')}
        onChange={onChange}
      />
    )

    expect(onChange).toHaveBeenCalledWith(Montant.of('1234'))
  })

  it('appelle onChange avec une nouvelle valeur après saisie utilisateur', async () => {
    const onChange = vi.fn<(montant: Optional<Montant>) => void>()
    const user = userEvent.setup()

    renderComponent(
      <MontantInput
        id="montantTest"
        montantInitial={Optional.empty()}
        onChange={onChange}
      />
    )

    const input = screen.getByRole('textbox', { name: '' })
    await user.clear(input)
    await user.type(input, '999')

    expect(onChange).toHaveBeenCalledWith(Montant.of('999'))
  })
})
