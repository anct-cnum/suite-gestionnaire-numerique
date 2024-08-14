import { fireEvent, render, screen, within } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'
import { ReactElement } from 'react'

import EnTete from './EnTete'
import { sessionUtilisateurContext } from '@/components/shared/SessionUtilisateurContext'
import { TypologieRole } from '@/domain/Role'

describe('en-tête : en tant qu’utilisateur authentifié', () => {
  it('quand j’affiche l’en-tête alors j’affiche les liens du menu', () => {
    // WHEN
    renderComponent(<EnTete />)

    // THEN
    const accueil = screen.getByRole('link', { name: 'FNE / Mednum' })
    expect(accueil).toHaveAttribute('href', '/')
    expect(accueil).toHaveAttribute('title', 'Accueil')

    const menu = screen.getByRole('list', { name: 'menu' })
    const menuItems = within(menu).getAllByRole('listitem')
    expect(menuItems).toHaveLength(4)

    const rechercher = within(menuItems[0]).getByRole('link', { name: 'Rechercher' })
    expect(rechercher).toHaveAttribute('href', '/')

    const aide = within(menuItems[1]).getByRole('link', { name: 'Aide' })
    expect(aide).toHaveAttribute('href', '/')

    const notifications = within(menuItems[2]).getByRole('link', { name: 'Notifications' })
    expect(notifications).toHaveAttribute('href', '/')

    const monCompte = within(menuItems[3]).getByRole('button', { name: 'Martin Tartempion' })
    expect(monCompte).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    expect(monCompte).toHaveAttribute('type', 'button')
  })

  it('quand je clique sur le bouton affichant mes nom et prénom alors le menu utilisateur s’ouvre', () => {
    // GIVEN
    renderComponent(<EnTete />)

    const menu = screen.getByRole('list', { name: 'menu' })
    const menuItems = within(menu).getAllByRole('listitem')
    const monCompte = within(menuItems[3]).getByRole('button', { name: 'Martin Tartempion' })

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
    expect(mesParametres).toHaveAttribute('href', '/mes-parametres')
    expect(mesParametres).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')

    const mesUtilisateurs = within(liens[2]).getByRole('link', { name: 'Mes utilisateurs' })
    expect(mesUtilisateurs).toHaveAttribute('href', '/')
    expect(mesUtilisateurs).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')

    const roles = screen.getByRole('combobox', { name: 'Rôle' })
    const admin = within(roles).getByRole('option', { name: 'Administrateur dispositif' })
    expect(admin).toBeInTheDocument()
    const gestionnaireDepartement = within(roles).getByRole('option', { name: 'Gestionnaire département' })
    expect(gestionnaireDepartement).toBeInTheDocument()
    const gestionnaireGroupement = within(roles).getByRole('option', { name: 'Gestionnaire groupement' })
    expect(gestionnaireGroupement).toBeInTheDocument()
    const gestionnaireRegion = within(roles).getByRole('option', { name: 'Gestionnaire région' })
    expect(gestionnaireRegion).toBeInTheDocument()
    const gestionnaireStructure = within(roles).getByRole('option', { name: 'Gestionnaire structure' })
    expect(gestionnaireStructure).toBeInTheDocument()
    const instructeur = within(roles).getByRole('option', { name: 'Instructeur' })
    expect(instructeur).toBeInTheDocument()
    const pilotePolitiquePublique = within(roles).getByRole('option', { name: 'Pilote politique publique' })
    expect(pilotePolitiquePublique).toBeInTheDocument()
    const supportAnimation = within(roles).getByRole('option', { name: 'Support animation' })
    expect(supportAnimation).toHaveAttribute('selected', '')
  })

  describe('le menu utilisateur étant ouvert', () => {
    it('quand je clique sur le bouton de fermeture alors il se ferme', () => {
      // GIVEN
      renderComponent(<EnTete />)

      const menu = screen.getByRole('list', { name: 'menu' })
      const menuItems = within(menu).getAllByRole('listitem')
      const monCompte = within(menuItems[3]).getByRole('button', { name: 'Martin Tartempion' })
      fireEvent.click(monCompte)

      const menuUtilisateur = screen.getByRole('dialog')
      const fermer = within(menuUtilisateur).getByRole('button', { name: 'Fermer le menu' })

      // WHEN
      fireEvent.click(fermer)

      // THEN
      expect(menuUtilisateur).not.toBeVisible()
    })

    it('quand je clique sur le bouton de déconnexion alors je suis déconnecté', () => {
      // GIVEN
      vi.spyOn(nextAuth, 'signOut').mockResolvedValueOnce({ url: '' })
      renderComponent(<EnTete />)

      const menu = screen.getByRole('list', { name: 'menu' })
      const menuItems = within(menu).getAllByRole('listitem')
      const monCompte = within(menuItems[3]).getByRole('button', { name: 'Martin Tartempion' })

      fireEvent.click(monCompte)

      const menuUtilisateur = screen.getByRole('dialog')
      const deconnexion = within(menuUtilisateur).getByRole('button', { name: 'Se déconnecter' })

      // WHEN
      fireEvent.click(deconnexion)

      // THEN
      expect(nextAuth.signOut).toHaveBeenCalledWith({ callbackUrl: '/connexion' })
    })
  })
})

const sessionUtilisateurContextProvider = {
  session: {
    email: 'martin.tartempion@example.net',
    nom: 'Tartempion',
    prenom: 'Martin',
    role: {
      libelle: 'Mednum',
      nom: 'Support animation' as TypologieRole,
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
