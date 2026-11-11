import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import ProgressBar from './ProgressBar'

describe('barre de progression des statistiques', () => {
  it('est masquée aux aides techniques : la valeur exacte est écrite à côté (RGAA 7.1)', () => {
    // WHEN
    render(
      <ProgressBar
        progress={[
          { label: '70 ans et plus', percentage: 18.2 },
          { label: '60 - 69 ans', percentage: 16.3 },
        ]}
        tooltipKey="tranches-age"
      />
    )

    // THEN
    expect(screen.queryByRole('progressbar')).not.toBeInTheDocument()
    expect(screen.getAllByRole('progressbar', { hidden: true })).toHaveLength(2)
  })
})
