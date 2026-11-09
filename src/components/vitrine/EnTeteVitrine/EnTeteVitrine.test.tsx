import { render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import EnTeteVitrine from './EnTeteVitrine'

vi.mock(import('next/navigation'), () => ({
  usePathname: (): string => '/',
}))

describe('en-tête de la vitrine', () => {
  it('le nom du service ramène à l’accueil de la vitrine avec un intitulé explicite', () => {
    // WHEN
    render(<EnTeteVitrine />)

    // THEN
    const enTete = screen.getByRole('banner')
    const lienAccueil = within(enTete).getByRole('link', { name: "Retour à l'accueil Inclusion Numérique" })
    expect(lienAccueil).toHaveAttribute('href', '/')
    expect(lienAccueil).not.toHaveAttribute('title')
    expect(within(lienAccueil).getByText('Inclusion Numérique')).toHaveAttribute('aria-hidden', 'true')
  })
})
