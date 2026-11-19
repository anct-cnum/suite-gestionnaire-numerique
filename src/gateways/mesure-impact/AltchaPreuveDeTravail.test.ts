import { Challenge, solveChallenge } from 'altcha-lib'
import { deriveKey } from 'altcha-lib/algorithms/sha'
import { describe, expect, it } from 'vitest'

import { AltchaPreuveDeTravail } from './AltchaPreuveDeTravail'

describe('preuve de travail ALTCHA', () => {
  it('une preuve résolue pour la campagne est valide jusqu’à son échéance, et identifiée par la signature du défi', async () => {
    // GIVEN
    const expiration = dansUneHeure()
    const defi = await preuveDeTravail.creer({ difficulte: 'normale', expiration, identifiantPublic: 'sicoval' })

    // WHEN
    const verifiee = await preuveDeTravail.verifier(await resoudre(defi), 'sicoval')

    // THEN
    expect(verifiee).toStrictEqual({
      empreinte: (JSON.parse(defi) as Challenge).signature,
      expiration: new Date(Math.floor(expiration.getTime() / 1000) * 1000),
    })
  })

  it('un défi renforcé demande une empreinte qui commence par un zéro de plus', async () => {
    // WHEN
    const normal = JSON.parse(await preuveDeTravail.creer(unDefi('normale'))) as Challenge
    const renforce = JSON.parse(await preuveDeTravail.creer(unDefi('renforcee'))) as Challenge

    // THEN
    expect(normal.parameters.keyPrefix).toBe('000')
    expect(renforce.parameters.keyPrefix).toBe('0000')
  })

  it.each([
    {
      intention: 'résolue pour une autre campagne',
      preuve: async (): Promise<string> => resoudre(await preuveDeTravail.creer(unDefi('normale', 'autre'))),
    },
    {
      intention: 'au défi expiré',
      preuve: async (): Promise<string> =>
        resoudre(
          await preuveDeTravail.creer({
            difficulte: 'normale',
            expiration: new Date('2026-01-01T00:00:00.000Z'),
            identifiantPublic: 'sicoval',
          })
        ),
    },
    {
      intention: 'au défi signé avec une autre clé',
      preuve: async (): Promise<string> =>
        resoudre(await new AltchaPreuveDeTravail('une-autre-cle').creer(unDefi('normale'))),
    },
    {
      intention: 'à la solution inventée',
      preuve: async (): Promise<string> => {
        const challenge = JSON.parse(await preuveDeTravail.creer(unDefi('normale'))) as Challenge
        return JSON.stringify({ challenge, solution: { counter: 1, derivedKey: '00' } })
      },
    },
    { intention: 'mal formée', preuve: async (): Promise<string> => Promise.resolve('{"challenge":') },
    { intention: 'vide', preuve: async (): Promise<string> => Promise.resolve('') },
  ])('une preuve $intention est refusée', async ({ preuve }) => {
    // WHEN
    const verifiee = await preuveDeTravail.verifier(await preuve(), 'sicoval')

    // THEN
    expect(verifiee).toBeNull()
  })

  it('sans clé secrète, aucun défi n’est proposé', async () => {
    // WHEN
    const creation = new AltchaPreuveDeTravail(undefined).creer(unDefi('normale'))

    // THEN
    await expect(creation).rejects.toThrow('La clé ALTCHA_HMAC_KEY n’est pas définie')
  })
})

const preuveDeTravail = new AltchaPreuveDeTravail('cle-de-test')

function dansUneHeure(): Date {
  return new Date(Date.now() + 3_600_000)
}

function unDefi(
  difficulte: 'normale' | 'renforcee',
  identifiantPublic = 'sicoval'
): Parameters<AltchaPreuveDeTravail['creer']>[0] {
  return { difficulte, expiration: dansUneHeure(), identifiantPublic }
}

// Ce que fait le navigateur
async function resoudre(defi: string): Promise<string> {
  const challenge = JSON.parse(defi) as Challenge
  const solution = await solveChallenge({ challenge, deriveKey })
  return JSON.stringify({ challenge, solution })
}
