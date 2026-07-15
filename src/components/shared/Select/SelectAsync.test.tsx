import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import SelectAsync from './SelectAsync'
import { renderComponent } from '@/components/testHelper'

describe('selectAsync', () => {
  it('affiche un label associé au champ', () => {
    // GIVEN
    renderComponent(
      <SelectAsync id="structure" loadOptions={async () => Promise.resolve([])}>
        Structure
      </SelectAsync>
    )

    // THEN
    const select = screen.getByRole('combobox', { name: 'Structure' })
    expect(select).toBeInTheDocument()
  })

  it('appelle onChange avec l’option choisie après une recherche', async () => {
    // GIVEN
    const onChange = vi.fn<(option: null | Readonly<{ label: string; value: string }>) => void>()
    renderComponent(
      <SelectAsync
        id="structure"
        loadOptions={async () => Promise.resolve([{ label: 'Emmaus Connect', value: '42' }])}
        onChange={onChange}
      >
        Structure
      </SelectAsync>
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Structure' }), 'emm')
    await userEvent.click(await screen.findByRole('option', { name: 'Emmaus Connect' }))

    // THEN
    expect(onChange).toHaveBeenCalledWith({ label: 'Emmaus Connect', value: '42' })
  })

  it('affiche le message d’absence de résultat quand la recherche ne donne rien', async () => {
    // GIVEN
    renderComponent(
      <SelectAsync
        id="structure"
        loadOptions={async () => Promise.resolve([])}
        noOptionsMessage={(inputValue) =>
          inputValue.length < 3 ? 'Saisissez au moins 3 caractères' : 'Pas de résultat'
        }
      >
        Structure
      </SelectAsync>
    )

    // WHEN
    await userEvent.type(screen.getByRole('combobox', { name: 'Structure' }), 'zz')

    // THEN
    const message = await screen.findByText('Saisissez au moins 3 caractères')
    expect(message).toBeInTheDocument()
  })
})
