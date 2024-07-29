import { fireEvent, render, screen, within } from '@testing-library/react'
import { ReactElement } from 'react'

import EnTete from './EnTete'
import { sessionUtilisateurNonAuthentifie } from '../../shared/SelecteurRole/session-utilisateur-presenter'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'

describe('en-tête', () => {
  it('étant connecté quand j’affiche l’en-tête alors j’affiche les liens du menu', () => {
    // WHEN
    renderComponent(<EnTete />)

    // THEN
    const accueil = screen.getByRole('link', { name: 'FNE / Mednum' })
    expect(accueil).toHaveAttribute('href', '/')
    expect(accueil).toHaveAttribute('title', 'Accueil')

    const menu = screen.getByRole('list', { name: 'menu' })
    const listItems = within(menu).getAllByRole('listitem')

    const rechercher = within(listItems[0]).getByRole('link', { name: 'Rechercher' })
    expect(rechercher).toHaveAttribute('href', '/')

    const aide = within(listItems[1]).getByRole('link', { name: 'Aide' })
    expect(aide).toHaveAttribute('href', '/')

    const notifications = within(listItems[2]).getByRole('link', { name: 'Notifications' })
    expect(notifications).toHaveAttribute('href', '/')

    const monCompte = within(listItems[3]).getByRole('button', { name: 'Martin Tartempion' })
    expect(monCompte).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    expect(monCompte).toHaveAttribute('type', 'button')
  })

  it('étant connecté, quand je clique sur le bouton affichant mes nom et prénom, le menu utilisateur s’ouvre', () => {
    // GIVEN
    renderComponent(<EnTete />)

    const menu = screen.getByRole('list', { name: 'menu' })
    const listItems = within(menu).getAllByRole('listitem')
    const monCompte = within(listItems[3]).getByRole('button', { name: 'Martin Tartempion' })

    // WHEN
    fireEvent.click(monCompte)

    // THEN
    const menuUtilisateur = screen.getByRole('dialog')
    expect(menuUtilisateur).toHaveAttribute('open')

    const fermer = within(menuUtilisateur).getByRole('button', { name: 'Fermer le menu' })
    expect(fermer).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    expect(fermer).toHaveAttribute('type', 'button')

    const deconnexion = within(menuUtilisateur).getByRole('button', { name: 'Se déconnecter' })
    expect(deconnexion).toHaveAttribute('name', 'deconnexion')
    expect(deconnexion).toHaveAttribute('type', 'button')

    expect(within(menuUtilisateur).getByRole('img')).toHaveAttribute('alt', '')

    const prenom = within(menuUtilisateur).getByText('Martin')
    expect(prenom).toBeInTheDocument()

    const nom = within(menuUtilisateur).getByText('Tartempion')
    expect(nom).toBeInTheDocument()

    const email = within(menuUtilisateur).getByText('martin.tartempion@example.net')
    expect(email).toBeInTheDocument()

    const liens = within(within(menuUtilisateur).getByRole('list', { name: 'liens-menu' })).getAllByRole('listitem')
    expect(liens).toHaveLength(3)

    const mesInformations = within(liens[0]).getByRole('link', { name: 'Mes informations' })
    expect(mesInformations).toHaveAttribute('href', '/mes-informations-personnelles')
    expect(mesInformations).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')

    const mesParametres = within(liens[1]).getByRole('link', { name: 'Mes paramètres' })
    expect(mesParametres).toHaveAttribute('href', '/')
    expect(mesParametres).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')

    const mesUtilisateurs = within(liens[2]).getByRole('link', { name: 'Mes utilisateurs' })
    expect(mesUtilisateurs).toHaveAttribute('href', '/')
    expect(mesUtilisateurs).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
  })

  it('le menu utilisateur étant ouvert, quand je clique sur le bouton de fermeture, il se ferme', () => {
    // GIVEN
    renderComponent(<EnTete />)

    const menu = screen.getByRole('list', { name: 'menu' })
    const listItems = within(menu).getAllByRole('listitem')
    const monCompte = within(listItems[3]).getByRole('button', { name: 'Martin Tartempion' })
    fireEvent.click(monCompte)

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le menu' }))

    // THEN
    expect(screen.queryByRole('dialog')).toBeNull()
  })

  it('étant connecté quand je clique sur le bouton de déconnexion alors je suis déconnecté', () => {
    // GIVEN
    renderComponent(<EnTete />)

    const menu = screen.getByRole('list', { name: 'menu' })
    const listItems = within(menu).getAllByRole('listitem')
    const monCompte = within(listItems[3]).getByRole('button', { name: 'Martin Tartempion' })

    fireEvent.click(monCompte)

    const menuUtilisateur = screen.getByRole('dialog')
    const deconnexion = within(menuUtilisateur).getByRole('button', { name: 'Se déconnecter' })

    // WHEN
    fireEvent.click(deconnexion)

    // THEN
    expect(sessionUtilisateurContextProvider.setSession).toHaveBeenCalledWith(sessionUtilisateurNonAuthentifie)
  })
})


const sessionUtilisateurContextProvider = {
  session: {
    email: 'martin.tartempion@example.net',
    nom: 'Tartempion',
    prenom: 'Martin',
    role: {
      libelle: 'Mednum',
      pictogramme: 'support-animation',
    },
  },
  setSession: vi.fn(),
}

function renderComponent(children: ReactElement) {
  render(
    <sessionUtilisateurContext.Provider value={sessionUtilisateurContextProvider}>
      {children}
    </sessionUtilisateurContext.Provider>
  )

}
