import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import VitrineHomePage from './page'

describe('page d’accueil de la vitrine', () => {
  it('le bouton « Accéder à la plateforme » mène à Mon Inclusion Numérique', () => {
    // WHEN
    render(<VitrineHomePage />)

    // THEN
    const lien = screen.getByRole('link', { name: 'Accéder à la plateforme' })
    expect(lien).toHaveAttribute('href', 'https://mon.inclusion-numerique.anct.gouv.fr/')
  })
})
