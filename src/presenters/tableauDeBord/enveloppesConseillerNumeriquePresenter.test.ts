import { describe, expect, it } from 'vitest'

import { enveloppesConseillerNumeriquePresenter } from './enveloppesConseillerNumeriquePresenter'
import { EnveloppeConseillerNumeriqueReadModel } from '@/use-cases/queries/RecupererLesEnveloppesConseillerNumerique'

describe(enveloppesConseillerNumeriquePresenter, () => {
  it('formate une enveloppe disponible avec consommation partielle', () => {
    // GIVEN
    const enveloppes: ReadonlyArray<EnveloppeConseillerNumeriqueReadModel> = [
      {
        consommation: BigInt(500_000),
        dateDeDebut: new Date('2024-01-01'),
        dateDeFin: new Date('2026-12-31'),
        libelle: 'Conseiller Numérique - initiale - État',
        plafond: 1_000_000,
      },
    ]
    const now = new Date('2025-06-01')

    // WHEN
    const result = enveloppesConseillerNumeriquePresenter(enveloppes, now)

    // THEN
    expect(result).toStrictEqual([
      {
        color: 'dot-purple-glycine-850-200',
        disponible: true,
        label: 'Conseiller Numérique - initiale - État',
        pourcentageConsomme: 50,
        total: '500,00 K€',
      },
    ])
  })

  it('marque une enveloppe fermée si la date courante est hors période', () => {
    // GIVEN
    const enveloppes: ReadonlyArray<EnveloppeConseillerNumeriqueReadModel> = [
      {
        consommation: BigInt(0),
        dateDeDebut: new Date('2024-01-01'),
        dateDeFin: new Date('2024-12-31'),
        libelle: 'Conseiller Numérique - Renouvellement - État',
        plafond: 2_000_000,
      },
    ]
    const now = new Date('2025-06-01')

    // WHEN
    const result = enveloppesConseillerNumeriquePresenter(enveloppes, now)

    // THEN
    expect(result[0].disponible).toBe(false)
  })

  it('retourne 0% si plafond est nul', () => {
    // GIVEN
    const enveloppes: ReadonlyArray<EnveloppeConseillerNumeriqueReadModel> = [
      {
        consommation: BigInt(0),
        dateDeDebut: new Date('2024-01-01'),
        dateDeFin: new Date('2026-12-31'),
        libelle: 'Conseiller Numérique - initiale - État',
        plafond: 0,
      },
    ]
    const now = new Date('2025-06-01')

    // WHEN
    const result = enveloppesConseillerNumeriquePresenter(enveloppes, now)

    // THEN
    expect(result[0].pourcentageConsomme).toBe(0)
  })
})
