import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import LienEvitement, { menuPrincipalVitrine } from './LienEvitement'

describe('lien d’évitement', () => {
  it('en tant qu’utilisateur authentifié, quand je navigue au clavier alors je peux aller sur toutes les parties du site rapidement', () => {
    // WHEN
    render(<LienEvitement />)

    // THEN
    const menuItems = afficherLesLiensDEvitement()
    expect(menuItems).toHaveLength(3)

    const lienContenu = within(menuItems[0]).getByRole('link', { name: 'Contenu' })
    expect(lienContenu).toHaveAttribute('href', '#content')

    const lienMenuUtilisateur = within(menuItems[1]).getByRole('link', { name: 'Menu utilisateur' })
    expect(lienMenuUtilisateur).toHaveAttribute('href', '#menuUtilisateur')

    const lienPiedDePage = within(menuItems[2]).getByRole('link', { name: 'Pied de page' })
    expect(lienPiedDePage).toHaveAttribute('href', '#footer')
  })

  it('sur le site vitrine, qui n’a pas de menu utilisateur, quand je navigue au clavier alors le deuxième lien mène au menu principal', () => {
    // WHEN
    render(<LienEvitement menu={menuPrincipalVitrine} />)

    // THEN
    const menuItems = afficherLesLiensDEvitement()
    expect(menuItems).toHaveLength(3)

    const lienContenu = within(menuItems[0]).getByRole('link', { name: 'Contenu' })
    expect(lienContenu).toHaveAttribute('href', '#content')

    const lienMenu = within(menuItems[1]).getByRole('link', { name: 'Menu' })
    expect(lienMenu).toHaveAttribute('href', '#navigation')

    const lienPiedDePage = within(menuItems[2]).getByRole('link', { name: 'Pied de page' })
    expect(lienPiedDePage).toHaveAttribute('href', '#footer')
  })
})

function afficherLesLiensDEvitement(): ReadonlyArray<HTMLElement> {
  const navigation = screen.getByRole('navigation', { name: 'Accès rapide' })
  const menu = within(navigation).getByRole('list')
  return within(menu).getAllByRole('listitem')
}
