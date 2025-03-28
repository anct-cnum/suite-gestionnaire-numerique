import { screen, within } from '@testing-library/react'

import MenuLateral from './MenuLateral'
import styles from './MenuLateral.module.css'
import { SousMenuGouvernance } from './SousMenuGouvernance'
import { renderComponent } from '@/components/testHelper'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

describe('menu lateral', () => {
  it('étant n’importe qui, quand j’affiche le menu latéral, alors il s’affiche avec le lien de mon tableau de bord', () => {
    // WHEN
    afficherMenuLateral()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menu = within(navigation).getByRole('list')
    const menuItems = within(menu).getAllByRole('listitem')
    const tableauDeBord = within(menuItems[0]).getByRole('link', { current: false, name: 'Tableau de bord' })
    expect(tableauDeBord).toHaveAttribute('href', '/tableau-de-bord')
    expect(menuItems[0]).not.toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
  })

  it.each([
    { index: 0, name: 'Gouvernance', url: '/gouvernance/93' },
    { index: 1, name: 'Membres', url: '/gouvernance/93/membres' },
    { index: 2, name: 'Feuilles de route', url: '/gouvernance/93/feuilles-de-route' },
  ])('étant un gestionnaire de département, quand j’affiche le menu latéral, alors il s’affiche avec le lien du menu $name', ({ index, name, url }) => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const pilotage = within(navigation).getByText('PILOTAGE', { selector: 'p' })
    expect(pilotage).toBeInTheDocument()
    const menus = screen.getAllByRole('list')
    const menuItems = within(menus[1]).getAllByRole('listitem')
    expect(menuItems).toHaveLength(3)
    expect(menuItems[index]).not.toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
    const element = within(menuItems[index]).getByRole('link', { current: false, name })
    expect(element).toHaveAttribute('href', url)
  })

  it.each([
    { index: 0, name: 'Financements', url: '/gouvernance/93/financements' },
    { index: 1, name: 'Bénéficiaires', url: '/gouvernance/93/beneficiaires' },
    { index: 2, name: 'Aidants et médiateurs', url: '/aidants-et-mediateurs' },
    { index: 3, name: 'Lieux d‘inclusion', url: '/lieux-inclusion' },
  ])('étant un gestionnaire de département, quand j’affiche le menu latéral, alors il s’affiche avec le lien du menu $name', ({ index, name, url }) => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const donneesEtStatistiques = within(navigation).getByText('à venir', { selector: 'p' })
    expect(donneesEtStatistiques).toBeInTheDocument()
    const menus = screen.getAllByRole('list')
    const menuItems = within(menus[3]).getAllByRole('listitem')
    expect(menuItems).toHaveLength(4)
    expect(menuItems[index]).not.toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
    const element = within(menuItems[index]).getByRole('link', { current: false, name })
    expect(element).toHaveAttribute('href', url)
  })

  it('étant un gestionnaire de département, quand j’affiche le menu Gouvernance, alors je peux le dérouler', () => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement()

    // THEN
    const menuGouvernance = screen.getByRole('link', { expanded: false, name: 'Gouvernance' })
    expect(menuGouvernance).toHaveAttribute('aria-controls', 'fr-sidemenu-gouvernance')
  })

  it.each([
    { index: 0, name: 'Tableau de bord', pathname: '/tableau-de-bord' },
    { index: 1, name: 'Gouvernance', pathname: '/gouvernance/93' },
    { index: 2, name: 'Membres', pathname: '/gouvernance/93/membres' },
    { index: 3, name: 'Financements', pathname: '/gouvernance/93/financements' },
  ])('étant un utilisateur, quand je clique sur un lien du menu, alors je vois qu’il est sélectionné', ({ index, name, pathname }) => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement(pathname)

    // THEN
    const menus = screen.getAllByRole('list')
    const menuItems = within(menus[index]).getAllByRole('listitem')
    expect(menuItems[0]).toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
    const element = within(menuItems[0]).getByRole('link', { current: 'page', name })
    expect(element).toBeInTheDocument()
  })

  it('étant un utilisateur autre que gestionnaire de département, quand j’affiche le menu latéral, alors il ne s’affiche pas avec le lien de la gouvernance', () => {
    // WHEN
    afficherMenuLateral()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menu = within(navigation).getByRole('list')
    const tableauDeBord = within(menu).queryByRole('link', { name: 'Gouvernance' })
    expect(tableauDeBord).not.toBeInTheDocument()
  })

  it('étant un utilisateur, quand les totaux sont à 0, alors je vois le menu Gouvernance sans sous menu', () => {
    // WHEN
    afficherMenuLateralGestionnaireDepartementSansSousMenu()

    // THEN
    const lienFeuillesDeRoute = screen.queryByRole('link', { name: 'Feuilles de route' })
    expect(lienFeuillesDeRoute).not.toBeInTheDocument()
    const lienMembres = screen.queryByRole('link', { name: 'Membres' })
    expect(lienMembres).not.toBeInTheDocument()
  })

  it.each([
    {
      expectedMenus: ['Feuilles de route'],
      feuillesTotal: '1',
      membresTotal: '0',
    },
    {
      expectedMenus: ['Membres'],
      feuillesTotal: '0',
      membresTotal: '1',
    },
  ])('étant un utilisateur, quand seul $expectedMenus est présent, alors je le vois', ({ expectedMenus, feuillesTotal, membresTotal }) => {
    // WHEN
    renderComponent(
      <MenuLateral>
        <SousMenuGouvernance
          isAfficherSousMenuFeuilleDeRoute={feuillesTotal !== '0'}
          isAfficherSousMenuMembre={membresTotal !== '0'}
        />
      </MenuLateral>,
      {
        pathname: '/gouvernance/93',
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
          displayLiensGouvernance: true,
        }),
      }
    )

    // THEN
    const menus = screen.getAllByRole('list')
    const sousList = within(menus[2]).getAllByRole('listitem')
    expect(sousList).toHaveLength(expectedMenus.length)
    expectedMenus.forEach((menuName, index) => {
      expect(within(sousList[index]).getByText(menuName)).toBeInTheDocument()
    })
  })
})

function afficherMenuLateral(): void {
  renderComponent(<MenuLateral />)
}

function afficherMenuLateralGestionnaireDepartement(pathname?: string): void {
  renderComponent(
    <MenuLateral>
      <SousMenuGouvernance
        isAfficherSousMenuFeuilleDeRoute={true}
        isAfficherSousMenuMembre={true}
      />
    </MenuLateral>,
    {
      pathname,
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        displayLiensGouvernance: true,
      }),
    },
    {
      departement: '93',
    }
  )
}

function afficherMenuLateralGestionnaireDepartementSansSousMenu(): void {
  renderComponent(
    <MenuLateral>
      <SousMenuGouvernance
        isAfficherSousMenuFeuilleDeRoute={false}
        isAfficherSousMenuMembre={false}
      />
    </MenuLateral>,
    {
      pathname: '/gouvernance/93',
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        displayLiensGouvernance: true,
      }),
    },
    {
      departement: '93',
    }
  )
}

