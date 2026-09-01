import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Header from './Header'
import * as rechercherTerritoiresModule from './rechercherTerritoires'
import { renderComponent } from '../../testHelper'

const mockPathname = vi.hoisted(() => ({ current: '' }))
const mockParams = vi.hoisted(() => ({ current: {} as Record<string, unknown> }))

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  useParams: vi.fn<() => Record<string, unknown>>(() => mockParams.current),
  usePathname: vi.fn<() => string>(() => mockPathname.current),
  useRouter: vi.fn<() => object>().mockReturnValue({
    back: vi.fn<() => void>(),
    prefetch: vi.fn<() => void>(),
    push: vi.fn<(url: string) => void>(),
    refresh: vi.fn<() => void>(),
    replace: vi.fn<() => void>(),
  }),
}))

describe('header des données territoriales', () => {
  it('sur une page EPCI, le fil d’Ariane contient la région et le département de rattachement', async () => {
    // GIVEN : URL publique du site vitrine, sans préfixe /vitrine (réécriture du proxy)
    mockPathname.current = '/donnees-territoriales/gouvernances/epci/243500741'
    mockParams.current = { code: ['243500741'], niveau: 'epci' }
    vi.spyOn(rechercherTerritoiresModule, 'rechercherTerritoires').mockResolvedValueOnce({
      territoires: [{ code: '243500741', nom: 'CA Redon Agglomération', numeroDepartement: '35', type: 'epci' }],
      total: 1,
    })

    // WHEN
    renderComponent(<Header titre="Données de l’inclusion numérique" />)

    // THEN
    const filAriane = screen.getByRole('navigation', { name: 'vous êtes ici :' })
    const lienDepartement = await within(filAriane).findByRole('link', { name: 'Ille-et-Vilaine · 35' })
    expect(lienDepartement).toHaveAttribute('href', '/vitrine/donnees-territoriales/gouvernances/departement/35')
    const lienRegion = within(filAriane).getByRole('link', { name: 'Bretagne' })
    expect(lienRegion).toHaveAttribute('href', '/vitrine/donnees-territoriales/synthese-et-indicateurs/region/53')
    const epci = within(filAriane).getByText('CA Redon Agglomération')
    expect(epci.textContent).toBe('CA Redon Agglomération')
  })

  it('sur une page départementale, le fil d’Ariane reste inchangé avec la région puis le département', () => {
    // GIVEN
    mockPathname.current = '/vitrine/donnees-territoriales/synthese-et-indicateurs/departement/69'
    mockParams.current = { code: ['69'], niveau: 'departement' }

    // WHEN
    renderComponent(<Header titre="Données de l’inclusion numérique" />)

    // THEN
    const filAriane = screen.getByRole('navigation', { name: 'vous êtes ici :' })
    const lienRegion = within(filAriane).getByRole('link', { name: 'Auvergne-Rhône-Alpes' })
    expect(lienRegion).toHaveAttribute('href', '/vitrine/donnees-territoriales/synthese-et-indicateurs/region/84')
    const departement = within(filAriane).getByText('Rhône · 69')
    expect(departement.textContent).toBe('Rhône · 69')
  })
})
