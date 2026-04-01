import { describe, expect, it } from 'vitest'

import { gouvernancesOptions } from './selecteurGouvernancePresenter'

describe(gouvernancesOptions, () => {
  it('transforme des codes département en options label/value', () => {
    // GIVEN
    const codes = ['01', '75']

    // WHEN
    const options = gouvernancesOptions(codes)

    // THEN
    expect(options).toStrictEqual([
      { label: '(01) Ain', value: '01' },
      { label: '(75) Paris', value: '75' },
    ])
  })

  it('retourne une liste vide si aucun code', () => {
    // GIVEN / WHEN / THEN
    expect(gouvernancesOptions([])).toStrictEqual([])
  })

  it('retourne juste le code si le département est introuvable', () => {
    // GIVEN
    const codes = ['99']

    // WHEN
    const options = gouvernancesOptions(codes)

    // THEN
    expect(options).toStrictEqual([{ label: '(99)', value: '99' }])
  })
})
