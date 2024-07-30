import { render, screen, within } from '@testing-library/react'

import LienEvitement from './LienEvitement'

describe('lien d’évitement', () => {
  it('en tant qu’utilisateur quand je navigue au clavier alors je peux aller sur toutes les parties du site rapidement', () => {
    // WHEN
    render(<LienEvitement />)

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Accès rapide' })
    const menu = within(navigation).getByRole('list')
    const menuItems = within(menu).getAllByRole('listitem')
    expect(menuItems).toHaveLength(3)

    const lienContenu = within(menuItems[0]).getByRole('link', { name: 'Contenu' })
    expect(lienContenu).toHaveAttribute('href', '#content')

    const lienMenuUtilisateur = within(menuItems[1]).getByRole('link', { name: 'Menu utilisateur' })
    expect(lienMenuUtilisateur).toHaveAttribute('href', '#menuUtilisateur')

    const lienPiedDePage = within(menuItems[2]).getByRole('link', { name: 'Pied de page' })
    expect(lienPiedDePage).toHaveAttribute('href', '#footer')
  })
})
