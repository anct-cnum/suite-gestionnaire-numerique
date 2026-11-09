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

  it.each([
    { href: 'https://www.societenumerique.gouv.fr/nos-ressources/etudes', intitule: 'Études' },
    { href: 'https://labo.societenumerique.gouv.fr/fr/', intitule: 'Labo Société Numérique' },
  ])('le lien « $intitule » du menu signale qu’il ouvre une nouvelle fenêtre', ({ href, intitule }) => {
    // WHEN
    render(<EnTeteVitrine />)

    // THEN
    const lien = screen.getByRole('link', { hidden: true, name: intitule })
    expect(lien).toHaveAttribute('href', href)
    expect(lien).toHaveAttribute('target', '_blank')
    expect(lien).toHaveAttribute('title', `${intitule} - nouvelle fenêtre`)
  })
})
