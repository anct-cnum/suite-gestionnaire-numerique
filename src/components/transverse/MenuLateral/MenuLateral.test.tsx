import { screen, within } from '@testing-library/react'

import MenuLateral from './MenuLateral'
import styles from './MenuLateral.module.css'
import { SousMenuGouvernance } from './SousMenuGouvernance'
import { renderComponent } from '@/components/testHelper'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

describe('menu lateral', () => {
  it('étant n\'importe qui, quand j\'affiche le menu latéral, alors il s\'affiche avec le lien de mon tableau de bord', () => {
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
    { name: 'Gouvernance', url: '/gouvernance/93' },
    { name: 'Lieux d\'inclusion', url: '/lieux-inclusion' },
  ])('étant un gestionnaire de département, quand j\'affiche le menu latéral, alors il s\'affiche avec le lien du menu $name', ({ name, url }) => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const pilotage = within(navigation).getByText('PILOTAGE', { selector: 'p' })
    expect(pilotage).toBeInTheDocument()
    const element = screen.getByRole('link', { name })
    expect(element).toHaveAttribute('href', url)
  })

  it.each([
    { name: 'Membres', url: '/gouvernance/93/membres' },
    { name: 'Feuilles de route', url: '/gouvernance/93/feuilles-de-route' },
  ])('étant un gestionnaire de département, quand j\'affiche le menu latéral, alors le sous-menu $name de Gouvernance s\'affiche', ({ name, url }) => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement()

    // THEN
    const elements = screen.getAllByRole('link', { name })
    expect(elements.length).toBeGreaterThan(0)
    expect(elements[0]).toHaveAttribute('href', url)
  })

  it.each([
    { name: 'Financements', url: '/gouvernance/93/financements' },
    { name: 'Bénéficiaires', url: '/gouvernance/93/beneficiaires' },
    { name: 'Aidants et médiateurs', url: '/gouvernance/93/aidants-mediateurs' },
  ])('étant un gestionnaire de département, quand j\'affiche le menu latéral, alors il s\'affiche dans la section A VENIR avec le lien du menu $name', ({ name, url }) => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const donneesEtStatistiques = within(navigation).getByText('à venir')
    expect(donneesEtStatistiques).toBeInTheDocument()
    const element = screen.getByRole('link', { name })
    expect(element).toHaveAttribute('href', url)
  })

  it('étant un gestionnaire de département, quand j\'affiche le menu Gouvernance, alors je peux le dérouler', () => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement()

    // THEN
    const menuGouvernance = screen.getByRole('link', { expanded: true, name: 'Gouvernance' })
    expect(menuGouvernance).toHaveAttribute('aria-controls', 'fr-sidemenu-gouvernance')
  })

  it.each([
    { itemIndex: 0, listIndex: 0, name: 'Tableau de bord', pathname: '/tableau-de-bord' },
    { itemIndex: 0, listIndex: 1, name: 'Gouvernance', pathname: '/gouvernance/93' },
    { itemIndex: 0, listIndex: 2, name: 'Membres', pathname: '/gouvernance/93/membres' },
    { itemIndex: 1, listIndex: 2, name: 'Feuilles de route', pathname: '/gouvernance/93/feuilles-de-route' },
    { itemIndex: 3, listIndex: 1, name: 'Aidants et médiateurs', pathname: '/gouvernance/93/aidants-mediateurs' },
    { itemIndex: 6, listIndex: 1, name: 'Lieux d\'inclusion', pathname: '/lieux-inclusion' },
    { itemIndex: 0, listIndex: 5, name: 'Financements', pathname: '/gouvernance/93/financements' },
    { itemIndex: 1, listIndex: 5, name: 'Bénéficiaires', pathname: '/gouvernance/93/beneficiaires' },
  ])('étant un utilisateur, quand j\'accède à l\'URL $pathname, alors l\'item $name du menu a le focus', ({ itemIndex, listIndex, name, pathname }) => {
    // WHEN
    afficherMenuLateralGestionnaireDepartement(pathname)

    // THEN
    const menus = screen.getAllByRole('list')
    const menuItems = within(menus[listIndex]).getAllByRole('listitem')
    
    // Vérifier que l'item a la classe active
    expect(menuItems[itemIndex]).toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
    
    // Vérifier que le lien a l'attribut aria-current="page"
    const element = within(menuItems[itemIndex]).getByRole('link', { current: 'page', name })
    expect(element).toBeInTheDocument()
    expect(element).toHaveAttribute('aria-current', 'page')
  })

  it('étant un utilisateur autre que gestionnaire de département, quand j\'affiche le menu latéral, alors il ne s\'affiche pas avec le lien de la gouvernance', () => {
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
