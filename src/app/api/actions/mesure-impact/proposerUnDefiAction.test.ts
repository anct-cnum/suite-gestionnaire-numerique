import { describe, expect, it, vi } from 'vitest'
import { ZodError } from 'zod'

import { proposerUnDefiAction } from './proposerUnDefiAction'
import { ProposerUnDefi } from '@/use-cases/mesure-impact/ProposerUnDefi'

describe('proposer un défi anti-abus au questionnaire public', () => {
  it('renvoie le défi de la campagne', async () => {
    // GIVEN
    vi.spyOn(ProposerUnDefi.prototype, 'handle').mockResolvedValueOnce('defi-signe')

    // WHEN
    const defi = await proposerUnDefiAction({ identifiantPublic: 'sicoval' })

    // THEN
    expect(ProposerUnDefi.prototype.handle).toHaveBeenCalledWith({ identifiantPublic: 'sicoval' })
    expect(defi).toBe('defi-signe')
  })

  it('refuse une demande sans campagne', async () => {
    // GIVEN
    const handle = vi.spyOn(ProposerUnDefi.prototype, 'handle')

    // WHEN
    const demande = proposerUnDefiAction({ identifiantPublic: '' })

    // THEN
    await expect(demande).rejects.toBeInstanceOf(ZodError)
    expect(handle).not.toHaveBeenCalled()
  })
})
