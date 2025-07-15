import * as nextCache from 'next/cache'

import { modifierUneNotePriveeAction } from './modifierUneNotePriveeAction'
import * as ssoGateway from '@/gateways/NextAuthAuthentificationGateway'
import { ModifierUneNotePrivee } from '@/use-cases/commands/ModifierUneNotePrivee'

describe('modifier une note privée action', () => {
  it('quand un note privée est modifiée, alors cela renvoie un succès et le cache de la page appelante est purgé', async () => {
    // GIVEN
    vi.spyOn(ssoGateway, 'getSessionSub').mockResolvedValueOnce('userFooId')
    vi.spyOn(nextCache, 'revalidatePath').mockImplementationOnce(vi.fn())
    vi.spyOn(ModifierUneNotePrivee.prototype, 'handle').mockResolvedValueOnce('OK')

    // WHEN
    const messages = await modifierUneNotePriveeAction({
      contenu: 'un contenu quelconque',
      path: '/gouvernance/11',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(ModifierUneNotePrivee.prototype.handle).toHaveBeenCalledWith({
      contenu: 'un contenu quelconque',
      uidEditeur: 'userFooId',
      uidGouvernance: 'gouvernanceFooId',
    })
    expect(nextCache.revalidatePath).toHaveBeenCalledWith('/gouvernance/11')
    expect(messages).toStrictEqual(['OK'])
  })

  it('quand un note privée est modifiée avec un chemin de page non renseigné, alors cela renvoie une erreur', async () => {
    // WHEN
    const messages = await modifierUneNotePriveeAction({
      contenu: '1',
      path: '',
      uidGouvernance: 'gouvernanceFooId',
    })

    // THEN
    expect(messages).toStrictEqual(['Le chemin doit être renseigné'])
  })
})
