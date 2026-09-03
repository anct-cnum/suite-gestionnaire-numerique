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

const contexteMembreFne = new Contexte('gestionnaire_structure', [
  { code: '42', type: 'structure' },
  { code: '93', type: 'membre' },
])

const contexteAdminDispositif = new Contexte('administrateur_dispositif', [{ type: 'france' }])

const contexteGestionnaireRegion = new Contexte('gestionnaire_region', [
  { code: '84', type: 'region' },
  { code: '01', type: 'membre' },
  { code: '69', type: 'coporteur' },
])

const contexteGestionnaireRegionMonoDepartement = new Contexte('gestionnaire_region', [
  { code: '01', type: 'region' },
  { code: '971', type: 'membre' },
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
    { itemIndex: 0, listIndex: 4, name: 'Statistiques', pathname: '/statistiques' },
    { itemIndex: 0, listIndex: 5, name: 'Financements', pathname: '/gouvernance/93/financements' },
    { itemIndex: 1, listIndex: 5, name: 'Bénéficiaires', pathname: '/gouvernance/93/beneficiaires' },
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

  it("étant administrateur dispositif, quand j'affiche le menu latéral, alors la section RAPPORTS ET STATISTIQUES s'affiche", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral contexte={contexteAdminDispositif} />
      </menuActifContext.Provider>
    )

    // THEN
    const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    expect(within(nav).getByText('RAPPORTS ET STATISTIQUES', { selector: 'p' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Rapports' })).toHaveAttribute('href', '/rapports')
    expect(within(nav).getByRole('link', { name: 'Statistiques' })).toHaveAttribute('href', '/statistiques')
  })

  it.each([
    { contexte: contexteParDefaut, intention: 'gestionnaire de région' },
    { contexte: contexteGouvernance, intention: 'gestionnaire de structure coporteur' },
    { contexte: contexteMembreFne, intention: 'gestionnaire de structure membre simple FNE' },
    {
      contexte: new Contexte('gestionnaire_departement', [{ code: '93', type: 'departement' }]),
      intention: 'gestionnaire de département',
    },
    { contexte: new Contexte('gestionnaire_groupement', []), intention: 'gestionnaire de groupement' },
  ])(
    "étant un $intention, quand j'affiche le menu latéral, alors Statistiques s'affiche mais pas Rapports",
    ({ contexte }) => {
      // WHEN
      render(
        <menuActifContext.Provider value="/">
          <MenuLateral contexte={contexte} />
        </menuActifContext.Provider>
      )

      // THEN
      const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
      expect(within(nav).getByText('RAPPORTS ET STATISTIQUES', { selector: 'p' })).toBeInTheDocument()
      expect(within(nav).getByRole('link', { name: 'Statistiques' })).toHaveAttribute('href', '/statistiques')
      expect(within(nav).queryByRole('link', { name: 'Rapports' })).not.toBeInTheDocument()
    }
  )

  it("étant administrateur dispositif, quand j'affiche le menu latéral, alors Rapports et Statistiques s'affichent", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral contexte={new Contexte('administrateur_dispositif', [{ type: 'france' }])} />
      </menuActifContext.Provider>
    )

    // THEN
    const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    expect(within(nav).getByText('RAPPORTS ET STATISTIQUES', { selector: 'p' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Rapports' })).toHaveAttribute('href', '/rapports')
    expect(within(nav).getByRole('link', { name: 'Statistiques' })).toHaveAttribute('href', '/statistiques')
  })

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

  it("étant un gestionnaire de département avec une structure, quand j'affiche le menu latéral, alors Ma structure pointe vers sa structure", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral
          contexte={
            new Contexte('gestionnaire_departement', [
              { code: '93', type: 'departement' },
              { code: '42', type: 'structure' },
            ])
          }
        />
      </menuActifContext.Provider>
    )

    // THEN
    const maStructure = screen.getByRole('link', { name: 'Ma structure' })
    expect(maStructure).toHaveAttribute('href', '/structure/42')
  })

  it("étant un gestionnaire de département sans structure identifiée, quand j'affiche le menu latéral, alors Ma structure pointe vers la page d'explication", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral contexte={new Contexte('gestionnaire_departement', [{ code: '93', type: 'departement' }])} />
      </menuActifContext.Provider>
    )

    // THEN
    const maStructure = screen.getByRole('link', { name: 'Ma structure' })
    expect(maStructure).toHaveAttribute('href', '/ma-structure-non-identifiee')
  })

  it.each([
    { name: 'Aidants et médiateurs', url: '/liste-aidants-mediateurs' },
    { name: "Lieux d'inclusion", url: '/liste-lieux-inclusion' },
  ])(
    "étant un gestionnaire de structure membre simple FNE, quand j'affiche le menu latéral, alors le listing $name est limité à sa structure",
    ({ name, url }) => {
      // WHEN
      render(
        <menuActifContext.Provider value="/">
          <MenuLateral contexte={contexteMembreFne} />
        </menuActifContext.Provider>
      )

      // THEN
      const element = screen.getByRole('link', { name })
      expect(element).toHaveAttribute('href', url)
    }
  )

  it("étant un gestionnaire de structure membre simple FNE, quand j'affiche le menu latéral, alors le menu Gouvernance reste visible", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral contexte={contexteMembreFne} />
      </menuActifContext.Provider>
    )

    // THEN
    const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    const gouvernance = within(nav).getByRole('link', { name: 'Gouvernance' })
    expect(gouvernance).toHaveAttribute('href', '/gouvernance/93')
  })

  it("étant un bêta-testeur, quand j'affiche le menu latéral, alors la section BÊTA TESTEUR s'affiche avec les liens des structures administratives et des doublons", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral contexte={new Contexte('administrateur_dispositif', [{ type: 'france' }], true)} />
      </menuActifContext.Provider>
    )

    // THEN
    const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    expect(within(nav).getByText('DÉVELOPPEUR', { selector: 'p' })).toBeInTheDocument()
    const structuresAdministratives = within(nav).getByRole('link', { name: 'Structures administratives' })
    expect(structuresAdministratives).toHaveAttribute('href', '/liste-structures-administratives')
    const doublons = within(nav).getByRole('link', { name: 'Doublons de structures' })
    expect(doublons).toHaveAttribute('href', '/structures-doublons')
    const appariements = within(nav).getByRole('link', { name: 'Appariements de lieux' })
    expect(appariements).toHaveAttribute('href', '/appariements-lieux')
  })

  it("étant un utilisateur non bêta-testeur, quand j'affiche le menu latéral, alors la section BÊTA TESTEUR n'est pas visible", () => {
    // WHEN
    afficherMenuLateral()

    // THEN
    const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
    expect(within(nav).queryByText('DÉVELOPPEUR', { selector: 'p' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Structures administratives' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Doublons de structures' })).not.toBeInTheDocument()
    expect(within(nav).queryByRole('link', { name: 'Appariements de lieux' })).not.toBeInTheDocument()
  })

  it.each([
    { name: 'Gouvernances', url: '/gouvernances/list' },
    { name: 'Aidants et médiateurs', url: '/liste-aidants-mediateurs' },
    { name: "Lieux d'inclusion", url: '/liste-lieux-inclusion' },
    { name: 'Structures', url: '/liste-structures' },
    { name: 'Suivi des postes CoNum', url: '/postes-conseiller-numerique' },
  ])(
    "étant un gestionnaire région multi-départements, quand j'affiche le menu latéral, alors la section PILOTAGE s'affiche avec le lien du menu $name",
    ({ name, url }) => {
      // WHEN
      render(
        <menuActifContext.Provider value="/">
          <MenuLateral contexte={contexteGestionnaireRegion} />
        </menuActifContext.Provider>
      )

      // THEN
      const nav = screen.getByRole('navigation', { name: 'Menu inclusion numérique' })
      expect(within(nav).getByText('PILOTAGE', { selector: 'p' })).toBeInTheDocument()
      const element = screen.getByRole('link', { name })
      expect(element).toHaveAttribute('href', url)
    }
  )

  it("étant un gestionnaire région sans structure de rattachement, quand j'affiche le menu latéral, alors Ma structure n'est pas visible", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral contexte={contexteGestionnaireRegion} />
      </menuActifContext.Provider>
    )

    // THEN
    const maStructure = screen.queryByRole('link', { name: 'Ma structure' })
    expect(maStructure).not.toBeInTheDocument()
  })

  it("étant un gestionnaire région avec une structure de rattachement, quand j'affiche le menu latéral, alors Ma structure pointe vers sa structure", () => {
    // WHEN
    render(
      <menuActifContext.Provider value="/">
        <MenuLateral
          contexte={
            new Contexte('gestionnaire_region', [
              { code: '84', type: 'region' },
              { code: '01', type: 'membre' },
              { code: '42', type: 'structure' },
            ])
          }
        />
      </menuActifContext.Provider>
    )

    // THEN
    const maStructure = screen.getByRole('link', { name: 'Ma structure' })
    expect(maStructure).toHaveAttribute('href', '/structure/42')
  })

  it.each([
    { name: 'Membres', url: '/gouvernance/971/membres' },
    { name: 'Feuilles de route', url: '/gouvernance/971/feuilles-de-route' },
  ])(
    "étant un gestionnaire région mono-département, quand j'affiche le menu latéral, alors le sous-menu $name de Gouvernance s'affiche",
    ({ name, url }) => {
      // WHEN
      render(
        <menuActifContext.Provider value="/">
          <MenuLateral contexte={contexteGestionnaireRegionMonoDepartement} />
        </menuActifContext.Provider>
      )

      // THEN
      const gouvernance = screen.getByRole('link', { name: 'Gouvernance' })
      expect(gouvernance).toHaveAttribute('href', '/gouvernance/971')
      const elements = screen.getAllByRole('link', { name })
      expect(elements.length).toBeGreaterThan(0)
      expect(elements[0]).toHaveAttribute('href', url)
    }
  )

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
