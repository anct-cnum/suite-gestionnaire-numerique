import { afterEach, describe, expect, it, vi } from 'vitest'

import { metadataPageNonTrouvee } from './not-found'

describe('page 404', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it.each([
    { hote: 'inclusion-numerique.anct.gouv.fr', intention: 'le domaine de la vitrine', siteMode: '' },
    { hote: 'localhost:3000', intention: 'le mode vitrine', siteMode: 'vitrine' },
  ])('sur $intention, le titre de la page contient le nom du site', ({ hote, siteMode }) => {
    // GIVEN
    vi.stubEnv('SITE_MODE', siteMode)

    // WHEN
    const metadata = metadataPageNonTrouvee(hote)

    // THEN
    expect(metadata.title).toBe('Page non trouvée - Inclusion Numérique')
  })

  it('sur Mon Inclusion Numérique, le titre de la page reste « Page non trouvée »', () => {
    // GIVEN
    vi.stubEnv('SITE_MODE', '')

    // WHEN
    const metadata = metadataPageNonTrouvee('mon.inclusion-numerique.anct.gouv.fr')

    // THEN
    expect(metadata.title).toBe('Page non trouvée')
  })
})
