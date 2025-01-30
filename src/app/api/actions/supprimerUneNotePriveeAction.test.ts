import * as nextCache from 'next/cache'

import { supprimerUneNotePriveeAction } from './supprimerUneNotePriveeAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { SupprimerUneNotePrivee } from '@/use-cases/commands/SupprimerUneNotePrivee'

describe('supprimer une note privée action', () => {
  it('quand un note privée est supprimée, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(SupprimerUneNotePrivee.prototype, 'execute').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await supprimerUneNotePriveeAction({
      path: '/gouvernance/11',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(SupprimerUneNotePrivee.prototype.execute).toHaveBeenCalledWith({
      uidEditeur: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un note privée est supprimée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await supprimerUneNotePriveeAction({
      path: '',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
