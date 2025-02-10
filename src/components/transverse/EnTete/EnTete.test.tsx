import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import EnTete from './EnTete'
import { presserLeBouton, renderComponent } from '@/components/testHelper'

describe('en-tête : en tant qu’utilisateur authentifié', () => {
  it('quand j’affiche l’en-tête alors j’affiche les liens du menu', () => {
    // WHEN
    afficherLEnTete()

    // THEN
    const accueil = screen.getByRole('link', { name: 'FNE / Mednum' })
    expect(accueil).toHaveAttribute('href', '/tableau-de-bord')
    expect(accueil).toHaveAttribute('title', 'Accueil')

    const menu = screen.getByRole('list', { name: 'menu' })
    const menuItems = within(menu).getAllByRole('listitem')
    expect(menuItems).toHaveLength(4)

    const rechercher = within(menuItems[0]).getByRole('link', { name: 'Rechercher' })
    expect(rechercher).toHaveAttribute('href', '/rechercher')

    const aide = within(menuItems[1]).getByRole('link', { name: 'Aide' })
    expect(aide).toHaveAttribute('href', '/aide')

    const notifications = within(menuItems[2]).getByRole('link', { name: 'Notifications' })
    expect(notifications).toHaveAttribute('href', '/notifications')

    const monCompte = within(menuItems[3]).getByRole('button', { name: 'Martin Tartempion' })
    expect(monCompte).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    expect(monCompte).toHaveAttribute('type', 'button')
  })

  it('quand je clique sur le bouton affichant mes nom et prénom alors le menu utilisateur s’ouvre', () => {
    // GIVEN
    afficherLEnTete()

    // WHEN
    jOuvreLeMenuUtilisateur()

    // THEN
    const menuUtilisateur = screen.getByRole('dialog')

    const deconnexion = within(menuUtilisateur).getByRole('button', { name: 'Se déconnecter' })
    expect(deconnexion).toHaveAttribute('name', 'deconnexion')
    expect(deconnexion).toHaveAttribute('type', 'button')

    expect(within(menuUtilisateur).getByRole('presentation')).toHaveAttribute('alt', '')

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
    expect(mesUtilisateurs).toHaveAttribute('href', '/mes-utilisateurs')
    expect(mesUtilisateurs).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')

    const roles = within(menuUtilisateur).getByRole('combobox', { name: 'Rôle' })
    const admin = within(roles).getByRole('option', { name: 'Administrateur dispositif' })
    expect(admin).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    const gestionnaireDepartement = within(roles).getByRole('option', { name: 'Gestionnaire département' })
    expect(gestionnaireDepartement).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    const gestionnaireGroupement = within(roles).getByRole('option', { name: 'Gestionnaire groupement' })
    expect(gestionnaireGroupement).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    const gestionnaireRegion = within(roles).getByRole('option', { name: 'Gestionnaire région' })
    expect(gestionnaireRegion).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    const gestionnaireStructure = within(roles).getByRole('option', { name: 'Gestionnaire structure' })
    expect(gestionnaireStructure).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    const instructeur = within(roles).getByRole('option', { name: 'Instructeur' })
    expect(instructeur).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    const pilotePolitiquePublique = within(roles).getByRole('option', { name: 'Pilote politique publique' })
    expect(pilotePolitiquePublique).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    const supportAnimation = within(roles).getByRole('option', { name: 'Support animation', selected: true })
    expect(supportAnimation).toBeInTheDocument()
  })

  describe('le menu utilisateur étant ouvert', () => {
    it('quand je clique sur le bouton de déconnexion alors je suis déconnecté', () => {
      // GIVEN
      vi.spyOn(nextAuth, 'signOut').mockResolvedValueOnce({ url: '' })
      afficherLEnTete()

      // WHEN
      jOuvreLeMenuUtilisateur()
      jeMeDeconnecte()

      // THEN
      expect(nextAuth.signOut).toHaveBeenCalledWith({ callbackUrl: '/connexion' })
    })

    it('quand je change de rôle dans le sélecteur de rôle alors mon rôle change et la page courante est rafraîchie', async () => {
      // GIVEN
      const changerMonRoleAction = vi.fn(async () => Promise.resolve(['OK']))
      afficherLEnTete(changerMonRoleAction)

      // WHEN
      jOuvreLeMenuUtilisateur()
      jeChangeMonRole()

      // THEN
      await waitFor(() => {
        expect(changerMonRoleAction).toHaveBeenCalledWith({ nouveauRole: 'Instructeur', path: '/' })
      })
    })

    it('quand je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLEnTete()

      // WHEN
      jOuvreLeMenuUtilisateur()
      const drawer = screen.getByRole('dialog')
      const fermer = jeFermeLeMenuUtilisateur()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
      expect(drawer).not.toBeVisible()
    })
  })

  function jOuvreLeMenuUtilisateur(): void {
    presserLeBouton('Martin Tartempion')
  }

  function jeFermeLeMenuUtilisateur(): HTMLElement {
    return presserLeBouton('Fermer le menu')
  }

  function jeChangeMonRole(): void {
    fireEvent.change(screen.getByRole('combobox', { name: 'Rôle' }), { target: { value: 'Instructeur' } })
  }

  function jeMeDeconnecte(): void {
    presserLeBouton('Se déconnecter')
  }

  function afficherLEnTete(spiedChangerMonRoleAction = async (): Promise<Array<string>> => Promise.resolve(['OK'])): void {
    renderComponent(<EnTete />, { changerMonRoleAction: spiedChangerMonRoleAction })
  }
})

