import { fireEvent, render, screen } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import Connexion from './Connexion'

describe('connexion : en tant qu’utilisateur non authentifié', () => {
  it('quand j’affiche une page quelconque alors je peux m’authentifier', () => {
    // GIVEN
    vi.spyOn(nextAuth, 'signIn').mockImplementationOnce(vi.fn())

    render(<Connexion idProvider={'pro-connect'} />)
    const boutonSeConnecter = screen.getByRole('button', { name: 'S’identifier avec ProConnect' })

    // WHEN
    fireEvent.click(boutonSeConnecter)

    // THEN
    expect(boutonSeConnecter).toHaveAttribute('type', 'button')
    expect(nextAuth.signIn).toHaveBeenCalledWith('pro-connect', { callbackUrl: '/' })
  })
})
