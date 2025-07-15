import { fireEvent, render, screen } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'
import { describe, expect, it } from 'vitest'

import Connexion from './Connexion'

describe('connexion : en tant qu’utilisateur non authentifié', () => {
  it('quand je me rend sur la page de connexion alors elle s’affiche', () => {
    // WHEN
    render(<Connexion idProvider="pro-connect" />)

    // THEN
    const surTitre = screen.getByText('Mon inclusion numérique')
    expect(surTitre).toBeInTheDocument()
    const informations = screen.getByText('Pilotez votre politique d’inclusion numérique grâce aux données')
    expect(informations).toBeInTheDocument()
    const titre = screen.getByRole('heading', { level: 1, name: 'Se connecter' })
    expect(titre).toBeInTheDocument()
    const sousTitre = screen.getByText('Accédez à ce service grâce à ProConnect, votre identifiant unique pour accéder à plusieurs services de l’État.', { selector: 'p' })
    expect(sousTitre).toBeInTheDocument()
    const boutonSeConnecter = screen.getByRole('button', { name: 'S’identifier avec ProConnect' })
    expect(boutonSeConnecter).toHaveAttribute('type', 'button')
    const lienProConnect = screen.getByRole('link', { name: 'En savoir plus sur ProConnect' })
    expect(lienProConnect).toHaveAttribute('href', 'https://www.proconnect.gouv.fr/')
    expect(lienProConnect).toOpenInNewTab('ProConnect')
  })

  it('quand j’affiche une page quelconque alors je peux m’authentifier', () => {
    // GIVEN
    vi.spyOn(nextAuth, 'signIn').mockImplementationOnce(vi.fn())
    render(<Connexion idProvider="pro-connect" />)

    // WHEN
    const button = screen.getByRole('button', { name: 'S’identifier avec ProConnect' })
    fireEvent.click(button)

    // THEN
    expect(nextAuth.signIn).toHaveBeenCalledWith('pro-connect', { callbackUrl: '/' })
  })
})
