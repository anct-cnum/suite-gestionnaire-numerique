import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import pageGouvernances from './page'
import { renderComponent, simulerResizeObserver } from '@/components/testHelper'
import { PrismaGouvernanceTerritorialeLoader } from '@/gateways/vitrine/PrismaGouvernanceTerritorialeLoader'
import { MembreTerritorialReadModel } from '@/use-cases/queries/vitrine/RecupererGouvernanceTerritoriale'

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

  it('le titre des membres est un h3, enfant de « Gouvernances », et le tableau n’est pas dans une zone nommée (RGAA 9.1)', async () => {
    // GIVEN
    vi.spyOn(PrismaGouvernanceTerritorialeLoader.prototype, 'get').mockResolvedValueOnce({
      membres: [
        membre('1', 'Préfecture du Rhône'),
        membre('2', 'Département du Rhône'),
        membre('3', 'Métropole de Lyon'),
      ],
      statistiques: {
        feuilleDeRoute: { action: 3, total: 1 },
        membre: { coporteur: 3, total: 3 },
      },
      territoire: 'Rhône',
    })

    // WHEN
    renderComponent(await pageGouvernances({ params: Promise.resolve({ code: ['69'], niveau: 'departement' }) }))

    // THEN
    const titres = screen.getAllByRole('heading').map((titre) => `${titre.tagName} ${titre.textContent}`)
    expect(titres.slice(0, 2)).toStrictEqual(['H2 Gouvernances', 'H3 3 membres de la gouvernance'])
    expect(screen.getByRole('table', { name: 'Membres de la gouvernance' })).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Membres de la gouvernance' })).not.toBeInTheDocument()
  })

  it('un seul membre : le titre est au singulier', async () => {
    // GIVEN
    vi.spyOn(PrismaGouvernanceTerritorialeLoader.prototype, 'get').mockResolvedValueOnce({
      membres: [membre('1', 'Préfecture du Rhône')],
      statistiques: {
        feuilleDeRoute: { action: 0, total: 0 },
        membre: { coporteur: 1, total: 1 },
      },
      territoire: 'Rhône',
    })

    // WHEN
    renderComponent(await pageGouvernances({ params: Promise.resolve({ code: ['69'], niveau: 'departement' }) }))

    // THEN
    expect(screen.getByRole('heading', { level: 3, name: '1 membre de la gouvernance' })).toBeInTheDocument()
  })
})

function membre(id: string, nom: string): MembreTerritorialReadModel {
  return { categorie: 'Collectivité', details: [], id, nom, roles: ['coporteur'], type: 'Collectivité' }
}
