import { beforeEach, describe, expect, it } from 'vitest'

import { ModifierLieuInclusionVisibiliteCartographie } from './ModifierLieuInclusionVisibiliteCartographie'
import {
  UpdateLieuInclusionVisibiliteCartographieData,
  UpdateLieuInclusionVisibiliteCartographieRepository,
} from './shared/LieuInclusionRepository'
import { epochTime } from '@/shared/testHelper'

describe('modifier la visibilité cartographique d’un lieu d’inclusion', () => {
  beforeEach(() => {
    spiedUpdateData = null
    lieuAUneAdresseBan = true
  })

  it('rend le lieu visible quand il a une adresse BAN', async () => {
    // WHEN
    const result = await modifierVisibilite().handle({ lieuId: '42', visiblePourCartographie: true })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUpdateData?.date).toStrictEqual(epochTime)
    expect(spiedUpdateData?.structureUid.state.value).toBe(42)
    expect(spiedUpdateData?.visiblePourCartographie).toBe(true)
  })

  it('masque le lieu même sans adresse BAN : masquer reste toujours possible (#1495)', async () => {
    // GIVEN
    lieuAUneAdresseBan = false

    // WHEN
    const result = await modifierVisibilite().handle({ lieuId: '42', visiblePourCartographie: false })

    // THEN
    expect(result).toBe('OK')
    expect(spiedUpdateData?.visiblePourCartographie).toBe(false)
  })

  it('refuse de rendre le lieu visible sans adresse BAN, sans rien enregistrer (#1495)', async () => {
    // GIVEN
    lieuAUneAdresseBan = false

    // WHEN
    const result = await modifierVisibilite().handle({ lieuId: '42', visiblePourCartographie: true })

    // THEN
    expect(result).toBe('adresseBanAbsente')
    expect(spiedUpdateData).toBeNull()
  })
})

let spiedUpdateData: null | UpdateLieuInclusionVisibiliteCartographieData
let lieuAUneAdresseBan: boolean

const lieuInclusionRepository: UpdateLieuInclusionVisibiliteCartographieRepository = {
  async aUneAdresseBan(): Promise<boolean> {
    return Promise.resolve(lieuAUneAdresseBan)
  },
  async updateVisibiliteCartographie(data: UpdateLieuInclusionVisibiliteCartographieData): Promise<void> {
    spiedUpdateData = data
    return Promise.resolve()
  },
}

function modifierVisibilite(): ModifierLieuInclusionVisibiliteCartographie {
  return new ModifierLieuInclusionVisibiliteCartographie(lieuInclusionRepository, epochTime)
}
