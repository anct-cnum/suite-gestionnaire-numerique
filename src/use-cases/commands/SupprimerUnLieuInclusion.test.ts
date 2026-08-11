import { beforeEach, describe, expect, it } from 'vitest'

import { SupprimerLieuInclusionData, SupprimerLieuInclusionRepository } from './shared/LieuInclusionRepository'
import { SupprimerUnLieuInclusion } from './SupprimerUnLieuInclusion'
import { epochTime } from '@/shared/testHelper'

describe('supprimer un lieu d’inclusion', () => {
  beforeEach(() => {
    spiedSupprimerData = null
  })

  it('quand la suppression est demandée, alors le lieu est supprimé logiquement avec la date', async () => {
    // GIVEN
    const supprimer = new SupprimerUnLieuInclusion(lieuInclusionRepository, epochTime)

    // WHEN
    const result = await supprimer.handle({
      lieuId: '42',
    })

    // THEN
    expect(result).toBe('OK')
    expect(spiedSupprimerData?.date).toStrictEqual(epochTime)
    expect(spiedSupprimerData?.structureUid.state.value).toBe(42)
  })
})

let spiedSupprimerData: null | SupprimerLieuInclusionData

const lieuInclusionRepository: SupprimerLieuInclusionRepository = {
  async supprimer(data: SupprimerLieuInclusionData): Promise<void> {
    spiedSupprimerData = data
    return Promise.resolve()
  },
}
