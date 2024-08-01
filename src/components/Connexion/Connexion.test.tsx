import { fireEvent, render, screen } from '@testing-library/react'
import * as nextAuth from 'next-auth/react'

import Connexion from './Connexion'
import { ProConnectProvider } from '@/gateways/ProConnectAuthentificationGateway'

describe('connexion', () => {
  it('étant déconnecté quand j’affiche une page quelconque alors je peux m’authentifier', () => {
    // GIVEN
    vi.spyOn(nextAuth, 'signIn').mockImplementationOnce(vi.fn())

    render(<Connexion provider={proConnectProvider['pro-connect']} />)
    const boutonSeConnecter = screen.getByRole('button', { name: 'S’identifier avec ProConnect' })

    // WHEN
    fireEvent.click(boutonSeConnecter)

    // THEN
    expect(boutonSeConnecter).toHaveAttribute('type', 'button')
    expect(nextAuth.signIn).toHaveBeenCalledWith('pro-connect', { callbackUrl: '/' })
  })
})

export const proConnectProvider: ProConnectProvider = {
  'pro-connect': {
    callbackUrl: 'http://localhost:3000/api/auth/callback/pro-connect',
    id: 'pro-connect',
    name: 'Pro Connect',
    signinUrl: 'http://localhost:3000/api/auth/signin/pro-connect',
    type: 'oauth',
  },
}
