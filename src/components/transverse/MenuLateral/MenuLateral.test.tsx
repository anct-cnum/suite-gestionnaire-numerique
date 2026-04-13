import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { menuActifContext } from './MenuActifContext'
import MenuLateral from './MenuLateral'
import styles from './MenuLateral.module.css'
import { Contexte } from '@/use-cases/queries/ResoudreContexte'

const contexteParDefaut = new Contexte('gestionnaire_region', [{ code: '84', type: 'region' }])

const contexteGouvernance = new Contexte('gestionnaire_structure', [
  { code: '42', type: 'structure' },
  { code: '93', type: 'coporteur' },
])

describe('menu lateral', () => {
  it("étant n'importe qui, quand j'affiche le menu latéral, alors il s'affiche avec le lien de mon tableau de bord", () => {
    // WHEN
    afficherMenuLateral()

    // THEN
    const navigation = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const menus = within(navigation).getAllByRole('list')
    const menuItems = within(menus[0]).getAllByRole('listitem')
    const tableauDeBord = within(menuItems[0]).getByRole('link', { current: false, name: 'Tableau de bord' })
    expect(tableauDeBord).toHaveAttribute('href', '/tableau-de-bord')
    expect(menuItems[0]).not.toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)
  })

  it.each([
    { name: 'Gouvernance', url: '/gouvernance/93' },
    { name: "Lieux d'inclusion", url: '/liste-lieux-inclusion' },
  ])(
    "étant un gestionnaire de département, quand j'affiche le menu latéral, alors il s'affiche avec le lien du menu $name",
    ({ name, url }) => {
      // WHEN
      afficherMenuLateralGouvernance()

      // THEN
      const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
      const pilotage = within(nav).getByText('PILOTAGE', { selector: 'p' })
      expect(pilotage).toBeInTheDocument()
      const element = screen.getByRole('link', { name })
      expect(element).toHaveAttribute('href', url)
    }
  )

  it.each([
    { name: 'Membres', url: '/gouvernance/93/membres' },
    { name: 'Feuilles de route', url: '/gouvernance/93/feuilles-de-route' },
  ])(
    "étant un gestionnaire de département, quand j'affiche le menu latéral, alors le sous-menu $name de Gouvernance s'affiche",
    ({ name, url }) => {
      // WHEN
      afficherMenuLateralGouvernance()

      // THEN
      const elements = screen.getAllByRole('link', { name })
      expect(elements.length).toBeGreaterThan(0)
      expect(elements[0]).toHaveAttribute('href', url)
    }
  )

  it.each([
    { name: 'Financements', url: '/gouvernance/93/financements' },
    { name: 'Bénéficiaires', url: '/gouvernance/93/beneficiaires' },
    { name: 'Aidants et médiateurs', url: '/gouvernance/93/aidants-mediateurs' },
  ])(
    "étant un gestionnaire de département, quand j'affiche le menu latéral, alors il s'affiche dans la section A VENIR avec le lien du menu $name",
    ({ name, url }) => {
      // WHEN
      afficherMenuLateralGouvernance()

      // THEN
      const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
      const donneesEtStatistiques = within(nav).getByText('à venir')
      expect(donneesEtStatistiques).toBeInTheDocument()
      const element = screen.getByRole('link', { name })
      expect(element).toHaveAttribute('href', url)
    }
  )

  it("étant un gestionnaire de département sur la page d'accueil, quand j'affiche le menu latéral, alors le sous-menu Gouvernance est replié", () => {
    // WHEN
    afficherMenuLateralGouvernance('/')

    // THEN
    const menuGouvernance = screen.getByRole('link', { expanded: false, name: 'Gouvernance' })
    expect(menuGouvernance).toHaveAttribute('aria-controls', 'fr-sidemenu-gouvernance')
  })

  it("étant un gestionnaire de département sur une page gouvernance, quand j'affiche le menu latéral, alors le sous-menu Gouvernance est déplié", () => {
    // WHEN
    afficherMenuLateralGouvernance('/gouvernance/93/membres')

    // THEN
    const menuGouvernance = screen.getByRole('link', { expanded: true, name: 'Gouvernance' })
    expect(menuGouvernance).toHaveAttribute('aria-controls', 'fr-sidemenu-gouvernance')
  })

  it.each([
    { itemIndex: 0, listIndex: 0, name: 'Tableau de bord', pathname: '/tableau-de-bord' },
    { itemIndex: 0, listIndex: 1, name: 'Ma structure', pathname: '/structure/42' },
    { itemIndex: 1, listIndex: 1, name: 'Mon équipe', pathname: '/mes-utilisateurs' },
    { itemIndex: 0, listIndex: 2, name: 'Gouvernance', pathname: '/gouvernance/93' },
    { itemIndex: 0, listIndex: 3, name: 'Membres', pathname: '/gouvernance/93/membres' },
    { itemIndex: 1, listIndex: 3, name: 'Feuilles de route', pathname: '/gouvernance/93/feuilles-de-route' },
    { itemIndex: 3, listIndex: 2, name: 'Aidants et médiateurs', pathname: '/gouvernance/93/aidants-mediateurs' },
    { itemIndex: 4, listIndex: 2, name: "Lieux d'inclusion", pathname: '/liste-lieux-inclusion' },
    { itemIndex: 0, listIndex: 4, name: 'Financements', pathname: '/gouvernance/93/financements' },
    { itemIndex: 1, listIndex: 4, name: 'Bénéficiaires', pathname: '/gouvernance/93/beneficiaires' },
  ])(
    "étant un utilisateur, quand j'accède à l'URL $pathname, alors l'item $name du menu a le focus",
    ({ itemIndex, listIndex, name, pathname }) => {
      // WHEN
      afficherMenuLateralGouvernance(pathname)

      // THEN
      const menus = screen.getAllByRole('list')
      const menuItems = within(menus[listIndex]).getAllByRole('listitem')

      // Vérifier que l'item a la classe active
      expect(menuItems[itemIndex]).toHaveClass(`fr-sidemenu__item--active ${styles['element-selectionne']}`)

      // Vérifier que le lien a l'attribut aria-current="page"
      const element = within(menuItems[itemIndex]).getByRole('link', { current: 'page', name })
      expect(element).toBeInTheDocument()
      expect(element).toHaveAttribute('aria-current', 'page')
    }
  )

  it("étant n'importe qui, quand j'affiche le menu latéral, alors la section ORGANISATION s'affiche avec Mon équipe", () => {
    // WHEN
    afficherMenuLateral()

    // THEN
    const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const organisation = within(nav).getByText('ORGANISATION', { selector: 'p' })
    expect(organisation).toBeInTheDocument()
    const monEquipe = screen.getByRole('link', { name: 'Mon équipe' })
    expect(monEquipe).toHaveAttribute('href', '/mes-utilisateurs')
  })

  it("étant un gestionnaire de structure avec une structure, quand j'affiche le menu latéral, alors Ma structure est visible", () => {
    // WHEN
    afficherMenuLateralGouvernance()

    // THEN
    const maStructure = screen.getByRole('link', { name: 'Ma structure' })
    expect(maStructure).toHaveAttribute('href', '/structure/42')
  })

  it("étant un utilisateur sans structure, quand j'affiche le menu latéral, alors Ma structure n'est pas visible", () => {
    // WHEN
    afficherMenuLateral()

    // THEN
    const maStructure = screen.queryByRole('link', { name: 'Ma structure' })
    expect(maStructure).not.toBeInTheDocument()
  })

  it("étant un utilisateur non gestionnaire de structure, quand j'affiche le menu latéral, alors Ma structure n'est pas visible", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral contexte={new Contexte('gestionnaire_departement', [{ code: '93', type: 'departement' }])} />
      </menuActifContext.Provider>
    )

    // THEN
    const maStructure = screen.queryByRole('link', { name: 'Ma structure' })
    expect(maStructure).not.toBeInTheDocument()
  })

  it("étant un utilisateur autre que gestionnaire de département, quand j'affiche le menu latéral, alors il ne s'affiche pas avec le lien de la gouvernance", () => {
    // WHEN
    afficherMenuLateral()

    // THEN
    const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const gouvernance = within(nav).queryByRole('link', { name: 'Gouvernance' })
    expect(gouvernance).not.toBeInTheDocument()
  })
})

function afficherMenuLateral(): void {
  render(
    <menuActifContext.Provider value="/">
      <MenuLateral contexte={contexteParDefaut} />
    </menuActifContext.Provider>
  )
}

function afficherMenuLateralGouvernance(pathname?: string): void {
  render(
    <menuActifContext.Provider value={pathname ?? '/'}>
      <MenuLateral contexte={contexteGouvernance} />
    </menuActifContext.Provider>
  )
}
