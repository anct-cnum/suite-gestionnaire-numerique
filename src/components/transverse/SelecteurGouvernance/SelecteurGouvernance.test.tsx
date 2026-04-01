import { render, screen } from '@testing-library/react'
import { select } from 'react-select-event'
import { describe, expect, it, vi } from 'vitest'

import SelecteurGouvernance from './SelecteurGouvernance'

const mockPush = vi.hoisted(() => vi.fn<(url: string) => void>())

vi.mock(import('next/navigation'), () => ({
  useRouter: vi.fn<() => object>().mockReturnValue({
    push: mockPush,
  }),
}))

const options = [
  { label: '(01) Ain', value: '01' },
  { label: '(75) Paris', value: '75' },
]

describe('selecteur gouvernance', () => {
  it('affiche la gouvernance courante sélectionnée', () => {
    // GIVEN / WHEN
    render(
      <>
        <label htmlFor="gouvernance">
          Gouvernance
        </label>
        <SelecteurGouvernance
          codeDepartementActuel="01"
          options={options}
        />
      </>
    )

    // THEN
    const combobox = screen.getByRole('combobox', { name: 'Gouvernance' })
    expect(combobox).toBeInTheDocument()
    expect(screen.getByText('(01) Ain')).toBeInTheDocument()
  })

  it('navigue vers le tableau de bord de la gouvernance sélectionnée', async () => {
    // GIVEN
    render(
      <>
        <label htmlFor="gouvernance">
          Gouvernance
        </label>
        <SelecteurGouvernance
          codeDepartementActuel="01"
          options={options}
        />
      </>
    )

    // WHEN
    await select(screen.getByRole('combobox', { name: 'Gouvernance' }), '(75) Paris')

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/tableau-de-bord/75')
  })
})
