import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import SectionSources from './SectionSources'

describe('section des sources et données utilisées', () => {
  it('son titre porte l’identifiant qui nomme la zone qui l’englobe', () => {
    // WHEN
    render(
      <section aria-labelledby="sources-donnees">
        <SectionSources />
      </section>
    )

    // THEN
    const zone = screen.getByRole('region', { name: 'Sources et données utilisées' })
    expect(zone).toBeInTheDocument()
    const titre = screen.getByRole('heading', { level: 2, name: 'Sources et données utilisées' })
    expect(titre).toBeInTheDocument()
  })
})
