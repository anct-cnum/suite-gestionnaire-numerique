import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ToolCard from './ToolCard'
import { renderComponent } from '../../testHelper'

describe('carte d’un outil', () => {
  it('l’icône qui accompagne le titre est décorative, seule la capture d’écran garde son alternative', () => {
    // WHEN
    renderComponent(
      <ToolCard
        description="Description de l’outil"
        icon="/vitrine/outils/icon-coop.png"
        imageAlt="Capture d'écran de La Coop de la Médiation"
        imageSrc="/vitrine/outils/visuel-coop.png"
        title="La Coop de la médiation numérique"
      />
    )

    // THEN
    const images = screen.getAllByRole('img')
    expect(images).toHaveLength(1)
    expect(images[0].getAttribute('alt')).toBe("Capture d'écran de La Coop de la Médiation")
    const icone = screen.getByRole('presentation', { hidden: true })
    expect(icone.getAttribute('src')).toBe('/vitrine/outils/icon-coop.png')
    expect(icone.getAttribute('alt')).toBe('')
    expect(icone.getAttribute('aria-hidden')).toBe('true')
  })
})
