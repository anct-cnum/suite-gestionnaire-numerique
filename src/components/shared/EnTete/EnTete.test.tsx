import { fireEvent, render, screen, within } from '@testing-library/react'
import { ReactElement } from 'react'

import EnTete from './EnTete'
import { sessionUtilisateurNonAuthentifie } from '../SelecteurRole/session-utilisateur-presenter'
import { InfosSessionUtilisateurContext, sessionUtilisateurContext } from '../session-utilisateur-context'

describe('en-tête', () => {
  it('étant connecté quand j’affiche l’en-tête alors j’affiche les liens du menu', () => {
    // GIVEN
    const sessionUtilisateurContextProvider = {
      session: {
        nom: 'Tartempion',
        prenom: 'Martin',
        role: {
          libelle: 'Mednum',
          pictogramme: 'support-animation',
        },
      },
      setSession: vi.fn(),
    }

    // WHEN
    renderComponent(<EnTete />, sessionUtilisateurContextProvider)

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

    const monCompte = within(listItems[3]).getByRole('link', { name: 'Martin Tartempion' })
    expect(monCompte).toHaveAttribute('href', '/')
  })

  it('étant connecté quand je clique sur la déconnexion alors je suis déconnecté', () => {
    // GIVEN
    const sessionUtilisateurContextProvider = {
      session: {
        nom: 'Tartempion',
        prenom: 'Martin',
        role: {
          libelle: 'Mednum',
          pictogramme: 'support-animation',
        },
      },
      setSession: vi.fn(),
    }
    renderComponent(<EnTete />, sessionUtilisateurContextProvider)

    const menu = screen.getByRole('list', { name: 'menu' })
    const listItems = within(menu).getAllByRole('listitem')
    const monCompte = within(listItems[3]).getByRole('link', { name: 'Martin Tartempion' })

    // WHEN
    fireEvent.click(monCompte)

    // THEN
    expect(sessionUtilisateurContextProvider.setSession).toHaveBeenCalledWith(sessionUtilisateurNonAuthentifie)
  })
})

function renderComponent(children: ReactElement, sessionUtilisateurContextProvider: InfosSessionUtilisateurContext) {
  render(
    <sessionUtilisateurContext.Provider value={sessionUtilisateurContextProvider}>
      {children}
    </sessionUtilisateurContext.Provider>
  )
}
