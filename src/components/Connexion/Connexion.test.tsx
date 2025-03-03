import { render, screen } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import Connexion from './Connexion'
import { presserLeBouton } from '../testHelper'

describe('connexion : en tant qu’utilisateur non authentifié', () => {
  it('quand je me rend sur la page de connexion alors elle s’affiche', () => {
    // WHEN
    render(<Connexion idProvider="pro-connect" />)

    // THEN
    const titre = screen.getByRole('heading', { level: 1, name: 'Connexion à la suite gestionnaire numérique' })
    expect(titre).toBeInTheDocument()
    const sousTitre = screen.getByRole('heading', { level: 2, name: 'Se connecter avec ProConnect' })
    expect(sousTitre).toBeInTheDocument()
    const boutonSeConnecter = screen.getByRole('button', { name: 'S’identifier avec ProConnect' })
    expect(boutonSeConnecter).toHaveAttribute('type', 'button')
    expect(boutonSeConnecter).toBeEnabled()
    const lienProConnect = screen.getByRole('link', { name: 'Qu’est ce que ProConnect ?' })
    expect(lienProConnect).toHaveAttribute('href', 'https://www.proconnect.gouv.fr/')
  })

  it('quand j’affiche une page quelconque alors je peux m’authentifier', () => {
    // GIVEN
    vi.spyOn(nextAuth, 'signIn').mockImplementationOnce(vi.fn())
    render(<Connexion idProvider="pro-connect" />)

    // WHEN
    presserLeBouton('S’identifier avec ProConnect')

    // THEN
    expect(nextAuth.signIn).toHaveBeenCalledWith('pro-connect', { callbackUrl: '/' })
  })
})
