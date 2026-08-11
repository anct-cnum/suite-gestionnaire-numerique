import { fireEvent, render, screen } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

import ConnexionLabel from './ConnexionLabel'

describe('connexion label : en tant qu’utilisateur non authentifié', () => {
  afterEach(() => {
    delete (globalThis as { _paq?: unknown })._paq
  })

  it('quand je me rends sur la page de connexion label alors elle s’affiche', () => {
    // WHEN
    render(<ConnexionLabel idProvider="pro-connect" />)

    // THEN
    const titreLabel = screen.getByRole('heading', {
      level: 2,
      name: /Comment demander le label conseiller numérique/,
    })
    expect(titreLabel).toBeInTheDocument()
    const etapes = screen.getAllByRole('listitem')
    expect(etapes).toHaveLength(4)
    expect(etapes[0].textContent).toContain('Je me connecte')
    expect(etapes[1].textContent).toContain('Je vérifie les informations')
    expect(etapes[2].textContent).toContain('Je signe l’attestation')
    expect(etapes[3].textContent).toContain('Mon label est actif')
    const titre = screen.getByRole('heading', { level: 1, name: 'Se connecter' })
    expect(titre).toBeInTheDocument()
    const sousTitre = screen.getByText(
      'Accédez à ce service grâce à ProConnect, votre identifiant unique pour accéder à plusieurs services de l’État.',
      { selector: 'p' }
    )
    expect(sousTitre).toBeInTheDocument()
    const boutonSeConnecter = screen.getByRole('button', { name: 'S’identifier avec ProConnect' })
    expect(boutonSeConnecter).toHaveAttribute('type', 'button')
    const lienProConnect = screen.getByRole('link', { name: 'En savoir plus sur ProConnect' })
    expect(lienProConnect).toHaveAttribute('href', 'https://www.proconnect.gouv.fr/')
    expect(lienProConnect).toOpenInNewTab('ProConnect')
  })

  it('quand je clique sur le bouton de connexion alors je peux m’authentifier', () => {
    // GIVEN
    vi.spyOn(nextAuth, 'signIn').mockImplementationOnce(vi.fn())
    render(<ConnexionLabel idProvider="pro-connect" />)

    // WHEN
    const button = screen.getByRole('button', { name: 'S’identifier avec ProConnect' })
    fireEvent.click(button)

    // THEN
    expect(nextAuth.signIn).toHaveBeenCalledWith('pro-connect', { callbackUrl: '/' })
  })

  it('quand je clique sur le bouton de connexion alors le clic est suivi dans le plan de marquage', () => {
    // GIVEN
    vi.spyOn(nextAuth, 'signIn').mockImplementationOnce(vi.fn())
    const push = vi.fn<(evenement: ReadonlyArray<string>) => void>()
    Object.assign(globalThis, { _paq: { push } })
    render(<ConnexionLabel idProvider="pro-connect" />)

    // WHEN
    fireEvent.click(screen.getByRole('button', { name: 'S’identifier avec ProConnect' }))

    // THEN
    expect(push).toHaveBeenCalledWith(['trackEvent', 'connexion_label', 'clic_connexion_proconnect'])
  })
})
