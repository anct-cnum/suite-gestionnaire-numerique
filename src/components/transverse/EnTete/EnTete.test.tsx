import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import EnTete from './EnTete'
import { renderComponent, stubbedServerAction } from '@/components/testHelper'
import { sessionUtilisateurViewModelFactory } from '@/presenters/testHelper'

describe('en-tête : en tant qu’utilisateur authentifié', () => {
  it('quand j’affiche l’en-tête alors j’affiche le bouton d’accueil et le menu utilisateur', () => {
    // WHEN
    afficherLEnTete()

    // THEN
    const accueil = screen.getByRole('link', { name: 'MIN / Mednum' })
    expect(accueil).toHaveAttribute('href', '/tableau-de-bord')
    expect(accueil).toHaveAttribute('title', 'Accueil')

    const monCompte = screen.getByRole('button', { name: 'Martin Tartempion' })
    expect(monCompte).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')
    expect(monCompte).toHaveAttribute('type', 'button')
  })

  it('quand je clique sur le bouton affichant mes nom et prénom alors le menu utilisateur s’ouvre', () => {
    // GIVEN
    afficherLEnTetePeutChangerDeRole()

    // WHEN
    jOuvreLeMenuUtilisateur()

    // THEN
    const drawer = screen.getByRole('dialog', { hidden: false })

    const deconnexion = within(drawer).getByRole('button', { name: 'Se déconnecter' })
    expect(deconnexion).toHaveAttribute('name', 'deconnexion')
    expect(deconnexion).toHaveAttribute('type', 'button')

    expect(within(drawer).getByRole('presentation')).toHaveAttribute('alt', '')

    const prenom = within(drawer).getByText('Martin')
    expect(prenom).toBeInTheDocument()

    const nom = within(drawer).getByText('Tartempion')
    expect(nom).toBeInTheDocument()

    const email = within(drawer).getByText('martin.tartempion@example.net')
    expect(email).toBeInTheDocument()

    const liens = within(within(drawer).getByRole('list', { name: 'liens-menu' })).getAllByRole('listitem')
    expect(liens).toHaveLength(3)

    const mesInformations = within(liens[0]).getByRole('link', { name: 'Mes informations' })
    expect(mesInformations).toHaveAttribute('href', '/mes-informations-personnelles')
    expect(mesInformations).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')

    const mesParametres = within(liens[1]).getByRole('link', { name: 'Mes paramètres' })
    expect(mesParametres).toHaveAttribute('href', '/mes-parametres')
    expect(mesParametres).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')

    const mesUtilisateurs = within(liens[2]).getByRole('link', { name: 'Mes utilisateurs' })
    expect(mesUtilisateurs).toHaveAttribute('href', '/mes-utilisateurs')
    expect(mesUtilisateurs).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')

    const roles = within(drawer).getByRole('combobox', { name: 'Rôle' })
    const admin = within(roles).getByRole('option', { name: 'Administrateur dispositif' })
    expect(admin).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')
    const gestionnaireDepartement = within(roles).getByRole('option', { name: 'Gestionnaire département' })
    expect(gestionnaireDepartement).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')
    const gestionnaireStructure = within(roles).getByRole('option', { name: 'Gestionnaire structure' })
    expect(gestionnaireStructure).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')
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
      const changerMonRoleAction = stubbedServerAction(['OK'])
      afficherLEnTetePeutChangerDeRole(changerMonRoleAction)

      // WHEN
      jOuvreLeMenuUtilisateur()
      jeChangeMonRole()

      // THEN
      await waitFor(() => {
        expect(changerMonRoleAction).toHaveBeenCalledWith({ nouveauRole: 'Gestionnaire structure', path: '/' })
      })
    })

    it('quand je clique sur fermer, alors le drawer se ferme', () => {
      // GIVEN
      afficherLEnTete()

      // WHEN
      jOuvreLeMenuUtilisateur()
      const drawer = screen.getByRole('dialog', { hidden: false })
      const fermer = jeFermeLeMenuUtilisateur()

      // THEN
      expect(fermer).toHaveAttribute('aria-controls', 'drawerMenuUtilisateurId')
      expect(drawer).not.toBeVisible()
    })

    it('si je ne suis pas autorisé à changer de rôle, alors le sélecteur de rôle n’est pas affiché', () => {
      // GIVEN
      afficherLEnTete()

      // WHEN
      jOuvreLeMenuUtilisateur()

      // THEN
      expect(screen.queryByRole('combobox', { name: 'Rôle' })).not.toBeInTheDocument()
    })
  })

  function jOuvreLeMenuUtilisateur(): void {
    presserLeBouton('Martin Tartempion')
  }

  function jeFermeLeMenuUtilisateur(): HTMLElement {
    return presserLeBouton('Fermer le menu')
  }

  function jeChangeMonRole(): void {
    fireEvent.change(screen.getByRole('combobox', { name: 'Rôle' }), { target: { value: 'Gestionnaire structure' } })
  }

  function jeMeDeconnecte(): void {
    presserLeBouton('Se déconnecter')
  }

  function afficherLEnTete(spiedChangerMonRoleAction = async (): Promise<Array<string>> => Promise.resolve(['OK'])): void {
    renderComponent(<EnTete />, { changerMonRoleAction: spiedChangerMonRoleAction,
      sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
        peutChangerDeRole: false,
      }) })
  }

  function afficherLEnTetePeutChangerDeRole(spiedChangerMonRoleAction = async (): Promise<ReadonlyArray<string>> => Promise.resolve(['OK'])): void {
    renderComponent(
      <EnTete />,
      {
        changerMonRoleAction: spiedChangerMonRoleAction,
        sessionUtilisateurViewModel: sessionUtilisateurViewModelFactory({
          peutChangerDeRole: true,
        }),
      }
    )
  }

  function presserLeBouton(name: string): HTMLElement {
    const button = screen.getByRole('button', { name })
    fireEvent.click(button)
    return button
  }
})

