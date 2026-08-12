import { describe, expect, it, vi } from 'vitest'

import blocLabelConum from './BlocLabelConum'
import BandeauLabelConum from '@/components/TableauDeBord/BandeauLabelConum'
import BandeauLabelConumActif from '@/components/TableauDeBord/BandeauLabelConumActif'
import { PrismaEligibiliteLabelConumLoader } from '@/gateways/tableauDeBord/PrismaEligibiliteLabelConumLoader'
import { epochTime } from '@/shared/testHelper'

describe('bloc label conum', () => {
  it('quand la structure a un label actif alors le bandeau de structure labellisée est rendu, sans calcul d’éligibilité', async () => {
    // GIVEN
    vi.useFakeTimers()
    vi.setSystemTime(epochTime)
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'derniereAttestation').mockResolvedValueOnce(epochTime)
    const estEligible = vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible')

    // WHEN
    const bloc = await blocLabelConum({ structureId: 42 })

    // THEN
    expect(bloc?.type).toBe(BandeauLabelConumActif)
    expect(estEligible).not.toHaveBeenCalled()
    vi.useRealTimers()
  })

  it('quand le label est expiré et que la structure est éligible alors le bandeau d’éligibilité est rendu', async () => {
    // GIVEN
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'derniereAttestation').mockResolvedValueOnce(epochTime)
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)

    // WHEN
    const bloc = await blocLabelConum({ structureId: 42 })

    // THEN
    expect(bloc?.type).toBe(BandeauLabelConum)
  })

  it('quand la structure est éligible et jamais labellisée alors le bandeau d’éligibilité est rendu', async () => {
    // GIVEN
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'derniereAttestation').mockResolvedValueOnce(null)
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(true)

    // WHEN
    const bloc = await blocLabelConum({ structureId: 42 })

    // THEN
    expect(bloc?.type).toBe(BandeauLabelConum)
  })

  it('quand la structure n’est ni labellisée ni éligible alors rien n’est rendu', async () => {
    // GIVEN
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'derniereAttestation').mockResolvedValueOnce(null)
    vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible').mockResolvedValueOnce(false)

    // WHEN
    const bloc = await blocLabelConum({ structureId: 42 })

    // THEN
    expect(bloc).toBeNull()
  })

  it('sans identifiant de structure, rien n’est rendu et aucune donnée n’est chargée', async () => {
    // GIVEN
    const derniereAttestation = vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'derniereAttestation')
    const estEligible = vi.spyOn(PrismaEligibiliteLabelConumLoader.prototype, 'estEligible')

    // WHEN
    const bloc = await blocLabelConum({ structureId: 0 })

    // THEN
    expect(bloc).toBeNull()
    expect(derniereAttestation).not.toHaveBeenCalled()
    expect(estEligible).not.toHaveBeenCalled()
  })
})
