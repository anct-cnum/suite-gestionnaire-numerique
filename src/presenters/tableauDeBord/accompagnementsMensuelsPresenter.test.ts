import { describe, expect, it } from 'vitest'

import { accompagnementsMensuelsPresenter } from './accompagnementsMensuelsPresenter'

describe('accompagnements mensuels presenter', () => {
  it('écrit les mois en toutes lettres, et signale en texte le mois en cours, incomplet', () => {
    // WHEN
    const mois = accompagnementsMensuelsPresenter([
      { mois: '10/26', nombre: 12_345 },
      { mois: '11/26', nombre: 678 },
    ])

    // THEN
    expect(mois).toStrictEqual([
      {
        enCours: false,
        libelleAxe: ['oct.'],
        libelleComplet: 'octobre 2026',
        nombre: 12_345,
        nombreAffiche: '12 345',
      },
      {
        enCours: true,
        libelleAxe: ['nov.', '(en cours)'],
        libelleComplet: 'novembre 2026 (mois en cours, incomplet)',
        nombre: 678,
        nombreAffiche: '678',
      },
    ])
  })

  it('garde tel quel un mois dont le format est inattendu', () => {
    // WHEN
    const [mois] = accompagnementsMensuelsPresenter([{ mois: 'Jan.', nombre: 10 }])

    // THEN
    expect(mois.libelleAxe).toStrictEqual(['Jan.', '(en cours)'])
    expect(mois.libelleComplet).toBe('Jan. (mois en cours, incomplet)')
  })
})
