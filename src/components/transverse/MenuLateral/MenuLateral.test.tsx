import { fireEvent, screen, within } from '@testing-library/react'

import MenuLateral from './MenuLateral'
import { renderComponent } from '@/components/testHelper'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

describe('menu lateral', () => {
  it('étant n’importe qui, quand j’affiche le menu latéral, alors il s’affiche avec les liens communs', () => {
    // WHEN
    renderComponent(<MenuLateral />)

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menu = within(navigation).getByRole('list')
    const menuItems = within(menu).getAllByRole('listitem')
    const tableauDeBord = within(menuItems[0]).getByRole('link', { name: 'Tableau de bord' })
    expect(tableauDeBord).toHaveAttribute('href', '/tableau-de-bord')
  })

  it('étant un gestionnaire de département, quand j’affiche le menu latéral, alors il s’affiche avec le lien de la gouvernance', () => {
    // WHEN
    renderComponent(<MenuLateral />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        codeDepartement: '93',
        displayLiensGouvernance: true,
      }),
    })

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menuItems = within(navigation).getAllByRole('listitem')
    expect(menuItems).toHaveLength(5)
    const tableauDeBord = within(menuItems[1]).getByRole('link', { name: 'Gouvernance' })
    expect(tableauDeBord).toHaveAttribute('href', '/gouvernance/93')
  })

  it('étant un gestionnaire de département, quand je clique sur menu Gouvernance, alors 2 sous menus s’affiche', () => {
    // WHEN
    renderComponent(<MenuLateral />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        codeDepartement: '93',
        displayLiensGouvernance: true,
      }),
    })

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menus = within(navigation).getAllByRole('listitem')
    expect(menus).toHaveLength(5)
    const menuGouvernance = within(menus[1]).getByRole('link', { name: 'Gouvernance' })
    fireEvent.click(menuGouvernance)
    const sousMenuMembres = screen.getByRole('link', { name: 'Membres' })
    expect (sousMenuMembres).toBeInTheDocument()
    const sousMenuFeuillesDeRoute = screen.getByRole('link', { name: 'Feuilles de route' })
    expect (sousMenuFeuillesDeRoute).toBeInTheDocument()
  })

  it('étant un utilisateur autre que gestionnaire de département, quand j’affiche le menu latéral, alors il ne s’affiche pas avec le lien de la gouvernance', () => {
    // WHEN
    renderComponent(<MenuLateral />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        codeDepartement: '93',
        displayLiensGouvernance: false,
      }),
    })

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menu = within(navigation).getByRole('list')
    const tableauDeBord = within(menu).queryByRole('link', { name: 'Gouvernance' })
    expect(tableauDeBord).not.toBeInTheDocument()
  })
})
