import { describe, expect, it } from 'vitest'

import { gouvernancesSelecteurPresenteur } from './selecteurGouvernancePresenter'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

describe(gouvernancesSelecteurPresenteur, () => {
  it('transforme des codes département en options label/value', () => {
    // GIVEN
    const contexte = new Contexte('gestionnaire_departement', [
      { code: '01', type: 'departement' },
      { code: '75', type: 'departement' },
    ])

    // WHEN
    const options = gouvernancesSelecteurPresenteur(contexte)

    // THEN
    expect(options).toStrictEqual([
      { label: 'Ain - 01', value: '01' },
      { label: 'Paris - 75', value: '75' },
    ])
  })

  it('retourne une liste vide si aucun code', () => {
    // GIVEN / WHEN / THEN
    expect(gouvernancesSelecteurPresenteur(new Contexte('gestionnaire_departement', []))).toStrictEqual([])
  })
})
