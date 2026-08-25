import { describe, expect, it } from 'vitest'

import { AppariementLieuRepository, DeciderAppariementLieu, DecisionAppariement } from './DeciderAppariementLieu'
import { epochTime } from '@/shared/testHelper'

describe('décider un appariement de lieu', () => {
  it('valide tous les segments de la paire en traçant qui et quand', async () => {
    // GIVEN
    const repository = new AppariementLieuRepositorySpy(2)
    const decider = new DeciderAppariementLieu(repository, epochTime)

    // WHEN
    const result = await decider.handle({
      cartoRecordId: 'RhinOcc_QxE__RhinOcc_RCR',
      decidePar: 'martin.tartempion@example.net',
      decision: 'valide',
      lieuId: 14800,
    })

    // THEN
    expect(result).toBe('OK')
    expect(repository.spiedDecision).toStrictEqual({
      cartoRecordId: 'RhinOcc_QxE__RhinOcc_RCR',
      decideLe: epochTime,
      decidePar: 'martin.tartempion@example.net',
      lieuId: 14800,
      statut: 'valide',
    })
  })

  it('rejette la paire', async () => {
    // GIVEN
    const repository = new AppariementLieuRepositorySpy(1)
    const decider = new DeciderAppariementLieu(repository, epochTime)

    // WHEN
    const result = await decider.handle({
      cartoRecordId: 'dora_123',
      decidePar: 'martin.tartempion@example.net',
      decision: 'rejete',
      lieuId: 42,
    })

    // THEN
    expect(result).toBe('OK')
    expect(repository.spiedDecision?.statut).toBe('rejete')
  })

  it('échoue quand aucun segment de la paire n’est encore à valider', async () => {
    // GIVEN
    const decider = new DeciderAppariementLieu(new AppariementLieuRepositorySpy(0), epochTime)

    // WHEN
    const result = await decider.handle({
      cartoRecordId: 'dora_123',
      decidePar: 'martin.tartempion@example.net',
      decision: 'valide',
      lieuId: 42,
    })

    // THEN
    expect(result).toBe('appariementIntrouvable')
  })
})

class AppariementLieuRepositorySpy implements AppariementLieuRepository {
  spiedDecision: DecisionAppariement | null = null
  readonly #nombreDeSegments: number

  constructor(nombreDeSegments: number) {
    this.#nombreDeSegments = nombreDeSegments
  }

  async decider(decision: DecisionAppariement): Promise<number> {
    this.spiedDecision = decision
    return Promise.resolve(this.#nombreDeSegments)
  }
}
