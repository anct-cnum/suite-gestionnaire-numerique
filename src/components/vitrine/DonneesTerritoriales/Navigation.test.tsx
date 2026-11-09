import { screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import Navigation from './Navigation'
import { renderComponent } from '../../testHelper'

// eslint-disable-next-line vitest/prefer-import-in-mock
vi.mock('next/navigation', () => ({
  useParams: vi.fn<() => Record<string, unknown>>(() => ({ code: ['69'], niveau: 'departement' })),
  usePathname: vi.fn<() => string>(() => '/vitrine/donnees-territoriales/gouvernances/departement/69'),
}))

describe('menu latéral des données territoriales', () => {
  it('est une zone de navigation nommée, distincte des autres navigations de la page', () => {
    // WHEN
    renderComponent(<Navigation />)

    // THEN
    const menu = screen.getByRole('navigation', { name: 'Rubriques des données territoriales' })
    expect(menu).not.toHaveAttribute('aria-labelledby')
    const rubriqueCourante = within(menu).getByRole('link', { current: 'page' })
    expect(rubriqueCourante.textContent).toBe('Gouvernances')
  })
})
