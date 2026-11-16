import { describe, expect, it } from 'vitest'

import { defiAProposer } from './AntiAbus'

describe('anti-abus du questionnaire public', () => {
  it.each([
    { difficulte: 'normale', intention: 'aucune réponse dans l’heure', reponsesDeLHeure: 0 },
    { difficulte: 'normale', intention: 'une séance collective nombreuse', reponsesDeLHeure: 99 },
    { difficulte: 'renforcee', intention: 'une rafale de réponses', reponsesDeLHeure: 100 },
  ])('propose un défi de difficulté $difficulte pour $intention', ({ difficulte, reponsesDeLHeure }) => {
    // WHEN
    const defi = defiAProposer(reponsesDeLHeure, new Date('2026-11-16T14:32:17.123Z'))

    // THEN
    expect(defi.difficulte).toBe(difficulte)
  })

  it('le défi expire une heure après avoir été proposé', () => {
    // WHEN
    const defi = defiAProposer(0, new Date('2026-11-16T14:32:17.123Z'))

    // THEN
    expect(defi.expiration.toJSON()).toBe('2026-11-16T15:32:17.123Z')
  })
})
