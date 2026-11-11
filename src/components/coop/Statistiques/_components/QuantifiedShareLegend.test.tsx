import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { QuantifiedShareLegend } from './QuantifiedShareLegend'

describe('légende chiffrée d’un graphique', () => {
  it('est une vraie liste dont chaque élément se lit d’un tenant (RGAA 9.3)', () => {
    // WHEN
    render(
      <QuantifiedShareLegend
        colors={['red', 'blue']}
        quantifiedShares={[
          { count: 26723, label: '70 ans et plus', proportion: 18.2 },
          { count: 23940, label: '60 - 69 ans', proportion: 16.3 },
        ]}
      />
    )

    // THEN
    const elements = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(elements).toHaveLength(2)
    expect(elements[0].textContent).toBe('70 ans et plus :26 723soit 18,2 %')
  })
})
