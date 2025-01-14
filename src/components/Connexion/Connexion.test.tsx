import { render } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import Connexion from './Connexion'
import { presserLeBouton } from '../testHelper'

describe('connexion : en tant qu’utilisateur non authentifié', () => {
  it('quand j’affiche une page quelconque alors je peux m’authentifier', () => {
    // GIVEN
    vi.spyOn(nextAuth, 'signIn').mockImplementationOnce(vi.fn())
    render(<Connexion idProvider="pro-connect" />)

    // WHEN
    const boutonSeConnecter = presserLeBouton('S’identifier avec ProConnect')

    // THEN
    expect(boutonSeConnecter).toHaveAttribute('type', 'button')
    expect(nextAuth.signIn).toHaveBeenCalledWith('pro-connect', { callbackUrl: '/' })
  })
})
