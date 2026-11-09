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

  it('un lien interne s’ouvre dans le même onglet', () => {
    // WHEN
    renderComponent(
      <ToolCard
        buttonText="Découvrir Mon Inclusion Numérique"
        description="Description de l’outil"
        imageAlt="Capture d'écran"
        imageSrc="/vitrine/outils/visuel-min.png"
        link="/vitrine/outils-numeriques/min"
        title="Mon inclusion Numérique"
      />
    )

    // THEN
    const lien = screen.getByRole('link', { name: 'Découvrir Mon Inclusion Numérique' })
    expect(lien.getAttribute('href')).toBe('/vitrine/outils-numeriques/min')
    expect(lien.getAttribute('target')).toBeNull()
    expect(lien.getAttribute('title')).toBeNull()
  })

  it('un lien externe s’ouvre dans une nouvelle fenêtre et le signale', () => {
    // WHEN
    renderComponent(
      <ToolCard
        buttonText="Découvrir Aidants Connect"
        description="Description de l’outil"
        imageAlt="Capture d'écran"
        imageSrc="/vitrine/outils/visuel-aidants-connect.png"
        link="https://aidantsconnect.beta.gouv.fr/"
        title="Aidants Connect"
      />
    )

    // THEN
    const lien = screen.getByRole('link', { name: 'Découvrir Aidants Connect' })
    expect(lien.getAttribute('href')).toBe('https://aidantsconnect.beta.gouv.fr/')
    expect(lien.getAttribute('target')).toBe('_blank')
    expect(lien.getAttribute('title')).toBe('Découvrir Aidants Connect - nouvelle fenêtre')
  })
})
