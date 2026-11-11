import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import pageGouvernances from './page'
import { renderComponent, simulerResizeObserver } from '@/components/testHelper'
import { PrismaGouvernanceTerritorialeLoader } from '@/gateways/vitrine/PrismaGouvernanceTerritorialeLoader'

describe('page vitrine des gouvernances', () => {
  beforeEach(() => {
    simulerResizeObserver()
  })

  it('un seul titre « Gouvernances » : celui de la carte, de niveau 2', async () => {
    // GIVEN
    vi.spyOn(PrismaGouvernanceTerritorialeLoader.prototype, 'get').mockResolvedValueOnce({
      membres: [],
      statistiques: {
        feuilleDeRoute: { action: 3, total: 1 },
        membre: { coporteur: 0, total: 0 },
      },
      territoire: 'Rhône',
    })

    // WHEN
    renderComponent(await pageGouvernances({ params: Promise.resolve({ code: ['69'], niveau: 'departement' }) }))

    // THEN
    const titres = screen.getAllByRole('heading', { name: 'Gouvernances' })
    expect(titres).toHaveLength(1)
    expect(titres[0].tagName).toBe('H2')
  })
})
