import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { ProgressItemList } from './ProgressItemList'

describe('liste chiffrée avec barres', () => {
  it('est une vraie liste dont chaque élément se lit d’un tenant, barre masquée (RGAA 7.1, 9.3)', () => {
    // WHEN
    render(
      <ProgressItemList
        items={[
          { count: 61706, label: 'Aide aux démarches administratives', proportion: 22.7 },
          { count: 12000, label: 'Prendre en main du matériel', proportion: 4.4 },
        ]}
        maxProportion={22.7}
      />
    )

    // THEN
    const elements = within(screen.getByRole('list')).getAllByRole('listitem')
    expect(elements).toHaveLength(2)
    expect(elements[0].textContent).toBe('Aide aux démarches administratives :61 706soit 22,7 %')
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
  })
})
