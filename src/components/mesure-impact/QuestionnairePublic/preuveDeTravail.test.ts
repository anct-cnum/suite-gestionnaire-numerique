// @vitest-environment node
import { Challenge, createChallenge, Solution, verifySolution } from 'altcha-lib'
import { deriveKey } from 'altcha-lib/algorithms/sha'
import { describe, expect, it, vi } from 'vitest'

import { preparerUnePreuve } from './preuveDeTravail'
import * as action from '@/app/api/actions/mesure-impact/proposerUnDefiAction'

describe('preuve de travail résolue par le navigateur', () => {
  it('résout le défi de la campagne, d’une façon que le serveur reconnaît', async () => {
    // GIVEN
    const defi = await createChallenge({
      algorithm: 'SHA-256',
      cost: 2,
      deriveKey,
      hmacSignatureSecret: CLE,
      keyPrefix: '00',
    })
    const proposer = vi.spyOn(action, 'proposerUnDefiAction').mockResolvedValueOnce(JSON.stringify(defi))

    // WHEN
    const preuve = JSON.parse(await preparerUnePreuve('sicoval')) as Readonly<{
      challenge: Challenge
      solution: Solution
    }>

    // THEN
    expect(proposer).toHaveBeenCalledWith({ identifiantPublic: 'sicoval' })
    const verification = await verifySolution({ ...preuve, deriveKey, hmacSignatureSecret: CLE })
    expect(verification.verified).toBe(true)
  })
})

const CLE = 'cle-de-test'
