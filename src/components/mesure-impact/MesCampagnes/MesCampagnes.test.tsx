import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import MesCampagnes from './MesCampagnes'

describe('mes campagnes de mesure d’impact', () => {
  it('donne accès à chaque campagne que porte la structure', () => {
    // WHEN
    render(
      <MesCampagnes campagnes={[{ identifiantPublic: 'sicoval', libelleTerritoire: 'Sicoval', nom: 'Pilote 2026' }]} />
    )

    // THEN
    expect(screen.getByRole('heading', { level: 1 }).textContent).toBe('Mesure d’impact')
    expect(screen.getByRole('link', { name: 'Pilote 2026' })).toHaveAttribute('href', '/mesure-impact/sicoval')
  })
})
