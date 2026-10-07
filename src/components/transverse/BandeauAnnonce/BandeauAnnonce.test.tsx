import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import BandeauAnnonce from './BandeauAnnonce'

const mockUsePathname = vi.hoisted(() => vi.fn<() => string>())

vi.mock(import('next/navigation'), () => ({
  usePathname: mockUsePathname,
}))

describe('bandeau d’annonce', () => {
  it('quand je suis sur le tableau de bord, alors le bandeau d’annonce s’affiche', () => {
    // GIVEN
    mockUsePathname.mockReturnValue('/tableau-de-bord')

    // WHEN
    render(<BandeauAnnonce />)

    // THEN
    const lien = screen.getByRole('link', {
      name: 'Cliquez-ici pour consulter le document présentant les nouveautés',
    })
    expect(lien).toHaveAttribute('href', 'https://docs.numerique.gouv.fr/docs/0943e42c-a300-4d90-95f2-4cbb4382b8fb')
  })

  it('quand je suis sur le tableau de bord d’un territoire, alors le bandeau d’annonce s’affiche', () => {
    // GIVEN
    mockUsePathname.mockReturnValue('/tableau-de-bord/region/84')

    // WHEN
    render(<BandeauAnnonce />)

    // THEN
    const lien = screen.getByRole('link', {
      name: 'Cliquez-ici pour consulter le document présentant les nouveautés',
    })
    expect(lien).toHaveAttribute('href', 'https://docs.numerique.gouv.fr/docs/0943e42c-a300-4d90-95f2-4cbb4382b8fb')
  })

  it('quand je ne suis pas sur le tableau de bord, alors le bandeau d’annonce ne s’affiche pas', () => {
    // GIVEN
    mockUsePathname.mockReturnValue('/autre-page')

    // WHEN
    render(<BandeauAnnonce />)

    // THEN
    expect(
      screen.queryByRole('link', { name: 'Cliquez-ici pour consulter le document présentant les nouveautés' })
    ).not.toBeInTheDocument()
  })
})
