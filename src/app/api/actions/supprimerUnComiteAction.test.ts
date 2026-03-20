import * as nextCache from 'next/cache'
import { describe, expect, it } from 'vitest'

import { supprimerUnComiteAction } from './supprimerUnComiteAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerUnComite } from '@/use-cases/commands/SupprimerUnComite'

describe('supprimer un comité action', () => {
  it('quand un comité est supprimé, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(SupprimerUnComite.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerUnComiteAction({
      path: '/gouvernance/11',
      uid: '1',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(SupprimerUnComite.prototype.handle).toHaveBeenCalledWith({
      uid: '1',
      uidEditeur: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un comité est supprimé avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await supprimerUnComiteAction({
      path: '',
      uid: '1',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
