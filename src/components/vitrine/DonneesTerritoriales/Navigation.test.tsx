import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Navigation from './Navigation'
import { renderComponent } from '../../testHelper'

const mockPathname = vi.hoisted(() => ({ current: '/donnees-territoriales/gouvernances/departement/69' }))

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  useParams: vi.fn<() => Record<string, unknown>>(() => ({ code: ['69'], niveau: 'departement' })),
  usePathname: vi.fn<() => string>(() => mockPathname.current),
}))

describe('menu latéral des données territoriales', () => {
  it('est une zone de navigation nommée, distincte des autres navigations de la page', () => {
    // GIVEN
    mockPathname.current = '/donnees-territoriales/gouvernances/departement/69'

    // WHEN
    renderComponent(<Navigation />)

    // THEN
    const menu = screen.getByRole('navigation', { name: 'Rubriques des données territoriales' })
    expect(menu).not.toHaveAttribute('aria-labelledby')
    const rubriqueCourante = within(menu).getByRole('link', { current: 'page' })
    expect(rubriqueCourante.textContent).toBe('Gouvernances')
  })

  it('sur mobile, le bouton qui déplie le menu dit l’action réalisée (RGAA 7.1)', () => {
    // WHEN
    renderComponent(<Navigation />)

    // THEN
    const menu = screen.getByRole('navigation', { name: 'Rubriques des données territoriales' })
    const boutonMobile = within(menu).getByRole('button', { expanded: false, name: 'Consulter les données' })
    expect(boutonMobile).toHaveAttribute('aria-controls', 'donnees-territoriales-menu-wrapper')
  })

  it.each([
    { intention: 'l’adresse publique', pathname: '/donnees-territoriales/gouvernances/departement/69' },
    {
      intention: 'une ancienne adresse préfixée',
      pathname: '/vitrine/donnees-territoriales/gouvernances/departement/69',
    },
  ])('en arrivée directe par $intention, la rubrique en cours est signalée (RGAA 10.10)', ({ pathname }) => {
    // GIVEN
    mockPathname.current = pathname

    // WHEN
    renderComponent(<Navigation />)

    // THEN
    const menu = screen.getByRole('navigation', { name: 'Rubriques des données territoriales' })
    const rubriqueCourante = within(menu).getByRole('link', { current: 'page' })
    expect(rubriqueCourante.textContent).toBe('Gouvernances')
    expect(rubriqueCourante).toHaveClass('fr-sidemenu__link')
    const rubriques = within(menu).getAllByRole('listitem')
    expect(rubriques[3]).toHaveClass('fr-sidemenu__item fr-sidemenu__item--active')
    expect(rubriques.filter((rubrique) => rubrique.classList.contains('fr-sidemenu__item--active'))).toHaveLength(1)
    expect(within(menu).getAllByRole('link', { current: false })).toHaveLength(4)
  })

  it('les rubriques pointent vers les adresses publiques du territoire, sans le préfixe technique /vitrine', () => {
    // WHEN
    renderComponent(<Navigation />)

    // THEN
    const menu = screen.getByRole('navigation', { name: 'Rubriques des données territoriales' })
    const adresses = within(menu)
      .getAllByRole('link')
      .map((lien) => lien.getAttribute('href'))
    expect(adresses).toStrictEqual([
      '/donnees-territoriales/synthese-et-indicateurs/departement/69',
      '/donnees-territoriales/lieux-inclusion/departement/69',
      '/donnees-territoriales/mediateurs-numeriques/departement/69',
      '/donnees-territoriales/gouvernances/departement/69',
      '/donnees-territoriales/feuille-de-route/departement/69',
    ])
  })
})
