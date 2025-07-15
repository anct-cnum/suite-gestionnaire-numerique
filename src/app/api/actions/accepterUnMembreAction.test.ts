import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { accepterUnMembreAction } from './accepterUnMembreAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { AccepterUnMembre } from '@/use-cases/commands/AccepterUnMembre'

describe('accepter un membre action', () => {
  it('quand un candidat ou un suggéré est ajouté à une gouvernance, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(AccepterUnMembre.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await accepterUnMembreAction({
      path: '/membres/11',
      uidGouvernance: 'gouvernanceFooId',
      uidMembrePotentiel: 'membreFooId',
    })

    // THEN
    expect(AccepterUnMembre.prototype.handle).toHaveBeenCalledWith({
      uidGestionnaire: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
      uidMembrePotentiel: 'membreFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/membres/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un candidat ou un suggéré est ajouté avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await accepterUnMembreAction({
      path: '',
      uidGouvernance: 'gouvernanceFooId',
      uidMembrePotentiel: 'membreFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
