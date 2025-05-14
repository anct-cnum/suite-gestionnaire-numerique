import { fireEvent, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import MontantInput from './MontantInput'
import { MontantPositif } from './MontantPositif'
import { renderComponent } from '@/components/testHelper'
import { Optional } from '@/shared/Optional'

describe('montantInput', () => {
  it('affiche le montant initial correctement', () => {
    renderComponent(
      <MontantInput
        id="montantTest"
        montantInitial={MontantPositif.of('1234')}
        onChange={vi.fn<(montant: Optional<MontantPositif>) => void>()}
      />
    )

    const input = screen.getByRole('textbox', { name: '' })
    expect(input).toHaveValue('1\u202f234')
  })

  it('appelle onChange avec une nouvelle valeur après saisie utilisateur', () => {
    const onChange = vi.fn<(montant: Optional<MontantPositif>) => void>()

    renderComponent(
      <MontantInput
        id="montantTest"
        montantInitial={Optional.empty()}
        onChange={onChange}
      />
    )

    const input = screen.getByRole('textbox', { name: '' })
    fireEvent.change(input, { target: { value: '999' } })

    expect(onChange).toHaveBeenCalledWith(MontantPositif.of('999'))
  })
})
