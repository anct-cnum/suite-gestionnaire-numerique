import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import SelecteurGouvernance from './SelecteurGouvernance'

const mockPush = vi.hoisted(() => vi.fn<(url: string) => void>())

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  useParams: vi.fn<() => object>().mockReturnValue({ code: '01' }),
  useRouter: vi.fn<() => object>().mockReturnValue({
    back: vi.fn<() => void>(),
    forward: vi.fn<() => void>(),
    prefetch: vi.fn<() => void>(),
    push: mockPush,
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }),
}))

const options = [
  { label: '(01) Ain', value: '01' },
  { label: '(75) Paris', value: '75' },
]

describe('selecteur gouvernance', () => {
  beforeEach(() => {
    mockPush.mockReset()
  })

  it('affiche la gouvernance courante sélectionnée', () => {
    // GIVEN / WHEN
    render(<SelecteurGouvernance options={options} />)

    // THEN
    const select = screen.getByRole('combobox', { name: 'Sélectionnez une gouvernance' })
    expect(select).toBeInTheDocument()
    expect(select).toHaveValue('')
  })

  it('navigue vers le tableau de bord de la gouvernance sélectionnée', () => {
    // GIVEN
    render(<SelecteurGouvernance options={options} />)

    // WHEN
    fireEvent.change(screen.getByRole('combobox', { name: 'Sélectionnez une gouvernance' }), {
      target: { value: '75' },
    })

    // THEN
    expect(mockPush).toHaveBeenCalledWith('/tableau-de-bord/departement/75')
  })
})
