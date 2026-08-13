import { describe, expect, it } from 'vitest'

import { clamperPeriode } from './dispositif'

describe('clamper une période', () => {
  it.each([
    {
      attendu: { au: '2025-03-31', du: '2025-01-01' },
      au: '2025-03-31',
      aujourdhui: '2025-06-01',
      du: '2025-01-01',
      intention: 'conserve une période valide',
    },
    {
      attendu: { au: '2025-03-31', du: '2020-11-17' },
      au: '2025-03-31',
      aujourdhui: '2025-06-01',
      du: '2018-01-01',
      intention: 'remonte une date de début antérieure au dispositif',
    },
    {
      attendu: { au: '2025-06-01', du: '2020-11-17' },
      au: '2029-01-01',
      aujourdhui: '2025-06-01',
      du: undefined,
      intention: 'ramène une date de fin dans le futur à aujourd’hui',
    },
    {
      attendu: { au: '2025-06-01', du: '2020-11-17' },
      au: undefined,
      aujourdhui: '2025-06-01',
      du: undefined,
      intention: 'applique les valeurs par défaut quand du/au sont absents',
    },
    {
      attendu: { au: '2025-06-01', du: '2020-11-17' },
      au: '202-08-047',
      aujourdhui: '2025-06-01',
      du: undefined,
      intention: 'ignore un au mal formé et applique la valeur par défaut',
    },
    {
      attendu: { au: '2025-06-01', du: '2020-11-17' },
      au: '....',
      aujourdhui: '2025-06-01',
      du: '....',
      intention: 'ignore un du et un au mal formés (pas juste une coïncidence de tri de chaînes)',
    },
  ])('$intention', ({ attendu, au, aujourdhui, du }) => {
    // WHEN
    const resultat = clamperPeriode(du, au, aujourdhui)

    // THEN
    expect(resultat).toStrictEqual(attendu)
  })
})
