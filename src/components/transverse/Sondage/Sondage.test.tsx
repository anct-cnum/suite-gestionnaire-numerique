import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Sondage from './Sondage'

const mockUsePathname = vi.hoisted(() => vi.fn<() => string>())

vi.mock(import('next/navigation'), () => ({
  usePathname: mockUsePathname,
}))

describe('bandeau sondage', () => {
  it('quand je suis sur le tableau de bord, alors le bandeau du sondage s’affiche', () => {
    // GIVEN
    mockUsePathname.mockReturnValue('/tableau-de-bord')

    // WHEN
    render(<Sondage />)

    // THEN
    const lien = screen.getByRole('link', { name: 'Cliquez-ici' })
    expect(lien).toHaveAttribute('href', 'https://tally.so/r/pbLzdV')
  })

  it('quand je ne suis pas sur le tableau de bord, alors le bandeau du sondage ne s’affiche pas', () => {
    // GIVEN
    mockUsePathname.mockReturnValue('/autre-page')

    // WHEN
    render(<Sondage />)

    // THEN
    expect(screen.queryByRole('link', { name: 'Cliquez-ici' })).not.toBeInTheDocument()
  })
})
