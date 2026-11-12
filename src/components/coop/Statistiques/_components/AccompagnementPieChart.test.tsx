import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { AccompagnementPieChart } from './AccompagnementPieChart'

describe('anneau des statistiques', () => {
  it('est masqué aux aides techniques et hors tabulation : sa légende textuelle le restitue (RGAA 1.1, 7.1)', async () => {
    // GIVEN
    vi.stubGlobal(
      'ResizeObserver',
      class {
        disconnect = vi.fn<() => void>()
        observe = vi.fn<() => void>()
        unobserve = vi.fn<() => void>()
      }
    )
    render(
      <>
        <AccompagnementPieChart
          colors={['red', 'blue']}
          data={[
            { count: 10, label: 'Individuel', proportion: 50 },
            { count: 10, label: 'Collectif', proportion: 50 },
          ]}
          isAnimationActive={false}
          size={80}
        />
        <button type="button">Après l’anneau</button>
      </>
    )

    // WHEN
    await userEvent.tab()

    // THEN
    expect(screen.queryByRole('application', { hidden: true })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Après l’anneau' })).toHaveFocus()
  })
})
