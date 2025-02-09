import { screen, within } from '@testing-library/react'

import MenuLateral from './MenuLateral'
import styles from './MenuLateral.module.css'
import { renderComponent } from '@/components/testHelper'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

describe('menu lateral', () => {
  it('étant n’importe qui, quand j’affiche le menu latéral, alors il s’affiche avec le lien de mon tableau de bord', () => {
    // WHEN
    renderComponent(<MenuLateral />)

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menu = within(navigation).getByRole('list')
    const menuItems = within(menu).getAllByRole('listitem')
    const tableauDeBord = within(menuItems[0]).getByRole('link', { name: 'Tableau de bord' })
    expect(tableauDeBord).toHaveAttribute('href', '/tableau-de-bord')
    expect(tableauDeBord).toHaveAttribute('aria-current', 'false')
    expect(menuItems[0]).not.toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
  })

  it.each([
    { index: 0, name: 'Gouvernance', url: '/gouvernance/93' },
    { index: 1, name: 'Membres', url: '/membres/93' },
    { index: 2, name: 'Feuilles de route', url: '/feuilles-de-routes/93' },
    { index: 3, name: 'Financements', url: '/financements' },
    { index: 4, name: 'Bénéficiaires', url: '/beneficiaires' },
    { index: 5, name: 'Aidants et médiateurs', url: '/aidants-et-mediateurs' },
    { index: 6, name: 'Lieux d’inclusion', url: '/lieux-inclusion' },
  ])('étant un gestionnaire de département, quand j’affiche le menu latéral, alors il s’affiche avec le lien du menu $name', ({ name, url, index }) => {
    // WHEN
    renderComponent(<MenuLateral />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        displayLiensGouvernance: true,
      }),
    })

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const pilotage = within(navigation).getByText('PILOTAGE', { selector: 'p' })
    expect(pilotage).toBeInTheDocument()
    const menus = screen.getAllByRole('list')
    const menuItems = within(menus[1]).getAllByRole('listitem')
    expect(menuItems).toHaveLength(7)
    expect(menuItems[index]).not.toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
    const element = within(menuItems[index]).getByRole('link', { name })
    expect(element).toHaveAttribute('href', url)
    expect(element).toHaveAttribute('aria-current', 'false')
  })

  it.each([
    { index: 0, name: 'Export de données', url: '/export-de-donnees' },
    { index: 1, name: 'Rapports', url: '/rapports' },
  ])('étant un gestionnaire de département, quand j’affiche le menu latéral, alors il s’affiche avec le lien du menu $name', ({ name, url, index }) => {
    // WHEN
    renderComponent(<MenuLateral />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        displayLiensGouvernance: true,
      }),
    })

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const donneesEtStatistiques = within(navigation).getByText('DONNÉES ET STATISTIQUES', { selector: 'p' })
    expect(donneesEtStatistiques).toBeInTheDocument()
    const menus = screen.getAllByRole('list')
    const menuItems = within(menus[3]).getAllByRole('listitem')
    expect(menuItems).toHaveLength(2)
    expect(menuItems[index]).not.toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
    const element = within(menuItems[index]).getByRole('link', { name })
    expect(element).toHaveAttribute('href', url)
    expect(element).toHaveAttribute('aria-current', 'false')
  })

  it('étant un gestionnaire de département, quand j’affiche le menu Gouvernance, alors je peux le dérouler', () => {
    // WHEN
    renderComponent(<MenuLateral />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        displayLiensGouvernance: true,
      }),
    })

    // THEN
    const menuGouvernance = screen.getByRole('link', { name: 'Gouvernance' })
    expect(menuGouvernance).toHaveAttribute('aria-controls', 'fr-sidemenu-gouvernance')
    expect(menuGouvernance).toHaveAttribute('aria-expanded', 'false')
  })

  it.each([
    { index: 0, name: 'Tableau de bord', pathname: '/tableau-de-bord' },
    { index: 1, name: 'Gouvernance', pathname: '/gouvernance/93' },
    { index: 2, name: 'Membres', pathname: '/membres/93' },
    { index: 3, name: 'Export de données', pathname: '/export-de-donnees' },
  ])('étant un utilisateur, quand je clique sur un lien du menu, alors je vois qu’il est sélectionné', ({ index, pathname, name }) => {
    // WHEN
    renderComponent(<MenuLateral />, {
      pathname,
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        displayLiensGouvernance: true,
      }),
    })

    // THEN
    const menus = screen.getAllByRole('list')
    const menuItems = within(menus[index]).getAllByRole('listitem')
    expect(menuItems[0]).toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
    const element = within(menuItems[0]).getByRole('link', { name })
    expect(element).toHaveAttribute('aria-current', 'page')
  })

  it('étant un utilisateur autre que gestionnaire de département, quand j’affiche le menu latéral, alors il ne s’affiche pas avec le lien de la gouvernance', () => {
    // WHEN
    renderComponent(<MenuLateral />, {
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
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
