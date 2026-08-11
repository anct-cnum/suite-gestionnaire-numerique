import { describe, expect, it, vi } from 'vitest'

import blocLabelConum from './BlocLabelConum'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'

describe('bloc label conum', () => {
  it('quand la structure est éligible alors le bandeau est rendu', async () => {
    // GIVEN
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)

    // WHEN
    const bloc = await blocLabelConum({ structureId: 42 })

    // THEN
    expect(bloc).not.toBeNull()
  })

  it('quand la structure n’est pas éligible alors rien n’est rendu', async () => {
    // GIVEN
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(false)

    // WHEN
    const bloc = await blocLabelConum({ structureId: 42 })

    // THEN
    expect(bloc).toBeNull()
  })

  it('sans identifiant de structure, rien n’est rendu et l’éligibilité n’est pas calculée', async () => {
    // GIVEN
    const estEligible = vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible')

    // WHEN
    const bloc = await blocLabelConum({ structureId: 0 })

    // THEN
    expect(bloc).toBeNull()
    expect(estEligible).not.toHaveBeenCalled()
  })
})
