import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import EnTete from './EnTete'
import { renderComponent, infosSessionUtilisateurContext } from '@/testHelper'
import { ChangerMonRole } from '@/use-cases/commands/ChangerMonRole'

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
    // WHEN
    fireEvent.click(monCompte())

    // THEN
    const menuUtilisateur = screen.getByRole('dialog')
    expect(menuUtilisateur).toHaveAttribute('open')

    const fermer = within(menuUtilisateur).getByRole('button', { name: 'Fermer le menu' })
    expect(fermer).toHaveAttribute('aria-controls', 'drawer-menu-utilisateur')
    expect(fermer).toHaveAttribute('type', 'button')

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
      const menuUtilisateur = ouvrirLeMenuUtilisateur()
      const fermer = within(menuUtilisateur).getByRole('button', { name: 'Fermer le menu' })

      // WHEN
      fireEvent.click(fermer)

      // THEN
      expect(menuUtilisateur).not.toBeVisible()
    })

    it('quand je clique sur le bouton de déconnexion alors je suis déconnecté', () => {
      // GIVEN
      vi.spyOn(nextAuth, 'signOut').mockResolvedValueOnce({ url: '' })
      const menuUtilisateur = ouvrirLeMenuUtilisateur()
      const deconnexion = within(menuUtilisateur).getByRole('button', { name: 'Se déconnecter' })

      // WHEN
      fireEvent.click(deconnexion)

      // THEN
      expect(nextAuth.signOut).toHaveBeenCalledWith({ callbackUrl: '/connexion' })
    })

    it('quand je change de rôle dans le sélecteur de rôle alors mon rôle change et la page courante est rafraîchie', async () => {
      // GIVEN
      vi.stubGlobal('location', { ...window.location, reload: vi.fn() })
      vi.spyOn(ChangerMonRole.prototype, 'execute').mockResolvedValueOnce('OK')
      const menuUtilisateur = ouvrirLeMenuUtilisateur()
      const role = within(menuUtilisateur).getByRole('combobox', { name: 'Rôle' })

      // WHEN
      fireEvent.change(role, { target: { value: 'Instructeur' } })

      // THEN
      await waitFor(() => {
        expect(ChangerMonRole.prototype.execute)
          .toHaveBeenCalledWith({
            nouveauRoleState: {
              nom: 'Instructeur',
            },
            utilisateurState: {
              ...infosSessionUtilisateurContext.session,
              isSuperAdmin: true,
              role: {
                nom: infosSessionUtilisateurContext.session.role.nom,
              },
            },
          })
      })
      expect(window.location.reload).toHaveBeenCalledOnce()
    })
  })

  it('quand je change de rôle avec un rôle invalide dans le sélecteur de rôle alors il ne se passe rien', async () => {
    // GIVEN
    vi.stubGlobal('location', { ...window.location, reload: vi.fn() })
    vi.spyOn(ChangerMonRole.prototype, 'execute').mockResolvedValueOnce('utilisateurNonAutoriseAChangerSonRole')
    const menuUtilisateur = ouvrirLeMenuUtilisateur()
    const role = within(menuUtilisateur).getByRole('combobox', { name: 'Rôle' })

    // WHEN
    fireEvent.change(role, { target: { value: 'roleInvalide' } })

    // THEN
    await waitFor(() => {
      expect(window.location.reload).not.toHaveBeenCalledOnce()
    })
  })
})

function monCompte(): HTMLElement {
  renderComponent(<EnTete />)

  const menu = screen.getByRole('list', { name: 'menu' })
  const menuItems = within(menu).getAllByRole('listitem')
  return within(menuItems[3]).getByRole('button', { name: 'Martin Tartempion' })
}

function ouvrirLeMenuUtilisateur(): HTMLElement {
  fireEvent.click(monCompte())

  return screen.getByRole('dialog')
}
